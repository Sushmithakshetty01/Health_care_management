create extension if not exists "pgcrypto";

create table if not exists app_users (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text unique not null,
  password_hash text not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz default now()
);

create table if not exists symptoms (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  department text not null,
  severity_weight int not null default 1,
  created_at timestamptz default now()
);

create table if not exists symptom_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references app_users(id) on delete cascade,
  symptom_ids uuid[] not null,
  age int,
  gender text,
  notes text,
  urgency text not null,
  recommended_department text not null,
  estimated_wait_minutes int not null,
  created_at timestamptz default now()
);

insert into symptoms (name, department, severity_weight) values
('Fever', 'General Medicine', 2),
('Cough', 'Pulmonology', 2),
('Chest Pain', 'Emergency / Cardiology', 6),
('Breathing Difficulty', 'Emergency / Pulmonology', 6),
('Severe Headache', 'Neurology', 4),
('Dizziness', 'General Medicine', 3),
('Vomiting', 'Gastroenterology', 3),
('Abdominal Pain', 'Gastroenterology', 4),
('Fracture Pain', 'Orthopedics', 5),
('Skin Rash', 'Dermatology', 2),
('High Blood Pressure', 'Cardiology', 4),
('Pregnancy Pain', 'Gynecology', 5),
('Eye Redness', 'Ophthalmology', 2),
('Ear Pain', 'ENT', 2),
('Weakness', 'General Medicine', 2)
on conflict (name) do nothing;

-- ------------------------------------------------------------------
-- BED AND RESOURCE MANAGEMENT
-- ------------------------------------------------------------------

create table if not exists beds (
  id uuid primary key default gen_random_uuid(),
  bed_number text unique not null,
  ward_type text not null,
  room_number text,
  floor_number int,
  status text not null default 'available'
    check (status in ('available', 'reserved', 'occupied', 'cleaning', 'maintenance')),
  patient_id uuid references app_users(id) on delete set null,
  assigned_at timestamptz,
  expected_release_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists bed_assignments (
  id uuid primary key default gen_random_uuid(),
  bed_id uuid not null references beds(id) on delete restrict,
  patient_id uuid not null references app_users(id) on delete restrict,
  assigned_by uuid not null references app_users(id) on delete restrict,
  admitted_at timestamptz not null default now(),
  expected_release_at timestamptz,
  released_at timestamptz,
  status text not null default 'active'
    check (status in ('active', 'completed', 'cancelled')),
  notes text,
  created_at timestamptz not null default now()
);

create unique index if not exists one_active_assignment_per_bed
  on bed_assignments (bed_id)
  where status = 'active';

create index if not exists beds_status_idx on beds (status);
create index if not exists beds_ward_type_idx on beds (ward_type);
create index if not exists bed_assignments_patient_idx on bed_assignments (patient_id);

create table if not exists resources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  resource_type text not null,
  total_quantity int not null default 0 check (total_quantity >= 0),
  available_quantity int not null default 0 check (available_quantity >= 0),
  unit text not null default 'units',
  location text,
  minimum_threshold int not null default 0 check (minimum_threshold >= 0),
  status text not null default 'active'
    check (status in ('active', 'maintenance', 'inactive')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint available_not_greater_than_total
    check (available_quantity <= total_quantity),
  constraint unique_resource_at_location
    unique (name, location)
);

create table if not exists resource_allocations (
  id uuid primary key default gen_random_uuid(),
  resource_id uuid not null references resources(id) on delete restrict,
  quantity int not null check (quantity > 0),
  patient_id uuid references app_users(id) on delete set null,
  bed_id uuid references beds(id) on delete set null,
  allocated_by uuid not null references app_users(id) on delete restrict,
  allocated_at timestamptz not null default now(),
  released_at timestamptz,
  status text not null default 'active'
    check (status in ('active', 'released', 'cancelled')),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists resource_transactions (
  id uuid primary key default gen_random_uuid(),
  resource_id uuid not null references resources(id) on delete restrict,
  allocation_id uuid references resource_allocations(id) on delete set null,
  transaction_type text not null
    check (transaction_type in ('add', 'remove', 'allocate', 'release', 'maintenance')),
  quantity int not null check (quantity > 0),
  performed_by uuid not null references app_users(id) on delete restrict,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists resources_type_idx on resources (resource_type);
create index if not exists resources_status_idx on resources (status);
create index if not exists resource_allocations_status_idx on resource_allocations (status);
create index if not exists resource_transactions_resource_idx
  on resource_transactions (resource_id, created_at desc);

create or replace function assign_bed(
  p_bed_id uuid,
  p_patient_id uuid,
  p_assigned_by uuid,
  p_expected_release_at timestamptz default null,
  p_notes text default null
)
returns jsonb
language plpgsql
security definer
as $$
declare
  selected_bed beds%rowtype;
  new_assignment bed_assignments%rowtype;
begin
  select * into selected_bed
  from beds
  where id = p_bed_id
  for update;

  if not found then
    raise exception 'Bed not found';
  end if;

  if selected_bed.status not in ('available', 'reserved') then
    raise exception 'Bed is not available for assignment';
  end if;

  if exists (
    select 1 from bed_assignments
    where bed_id = p_bed_id and status = 'active'
  ) then
    raise exception 'Bed already has an active assignment';
  end if;

  insert into bed_assignments (
    bed_id, patient_id, assigned_by, expected_release_at, notes
  )
  values (
    p_bed_id, p_patient_id, p_assigned_by, p_expected_release_at, p_notes
  )
  returning * into new_assignment;

  update beds
  set status = 'occupied',
      patient_id = p_patient_id,
      assigned_at = new_assignment.admitted_at,
      expected_release_at = p_expected_release_at,
      updated_at = now()
  where id = p_bed_id;

  return to_jsonb(new_assignment);
end;
$$;

create or replace function release_bed(
  p_bed_id uuid,
  p_released_by uuid,
  p_notes text default null
)
returns jsonb
language plpgsql
security definer
as $$
declare
  active_assignment bed_assignments%rowtype;
begin
  perform 1 from beds where id = p_bed_id for update;

  if not found then
    raise exception 'Bed not found';
  end if;

  select * into active_assignment
  from bed_assignments
  where bed_id = p_bed_id and status = 'active'
  for update;

  if not found then
    raise exception 'No active assignment found for this bed';
  end if;

  update bed_assignments
  set status = 'completed',
      released_at = now(),
      notes = case
        when p_notes is null or btrim(p_notes) = '' then notes
        when notes is null or btrim(notes) = '' then p_notes
        else notes || E'\nRelease: ' || p_notes
      end
  where id = active_assignment.id
  returning * into active_assignment;

  update beds
  set status = 'cleaning',
      patient_id = null,
      assigned_at = null,
      expected_release_at = null,
      updated_at = now()
  where id = p_bed_id;

  return to_jsonb(active_assignment);
end;
$$;

create or replace function adjust_resource_stock(
  p_resource_id uuid,
  p_quantity_change int,
  p_performed_by uuid,
  p_notes text default null
)
returns jsonb
language plpgsql
security definer
as $$
declare
  selected_resource resources%rowtype;
  transaction_kind text;
begin
  if p_quantity_change = 0 then
    raise exception 'Quantity change cannot be zero';
  end if;

  select * into selected_resource
  from resources
  where id = p_resource_id
  for update;

  if not found then
    raise exception 'Resource not found';
  end if;

  if selected_resource.total_quantity + p_quantity_change < 0
     or selected_resource.available_quantity + p_quantity_change < 0 then
    raise exception 'Stock adjustment would make quantity negative';
  end if;

  transaction_kind := case when p_quantity_change > 0 then 'add' else 'remove' end;

  update resources
  set total_quantity = total_quantity + p_quantity_change,
      available_quantity = available_quantity + p_quantity_change,
      updated_at = now()
  where id = p_resource_id
  returning * into selected_resource;

  insert into resource_transactions (
    resource_id, transaction_type, quantity, performed_by, notes
  )
  values (
    p_resource_id, transaction_kind, abs(p_quantity_change), p_performed_by, p_notes
  );

  return to_jsonb(selected_resource);
end;
$$;

create or replace function allocate_resource(
  p_resource_id uuid,
  p_quantity int,
  p_allocated_by uuid,
  p_patient_id uuid default null,
  p_bed_id uuid default null,
  p_notes text default null
)
returns jsonb
language plpgsql
security definer
as $$
declare
  selected_resource resources%rowtype;
  new_allocation resource_allocations%rowtype;
begin
  if p_quantity <= 0 then
    raise exception 'Allocation quantity must be greater than zero';
  end if;

  select * into selected_resource
  from resources
  where id = p_resource_id
  for update;

  if not found then
    raise exception 'Resource not found';
  end if;

  if selected_resource.status <> 'active' then
    raise exception 'Resource is not active';
  end if;

  if selected_resource.available_quantity < p_quantity then
    raise exception 'Insufficient resource quantity';
  end if;

  insert into resource_allocations (
    resource_id, quantity, patient_id, bed_id, allocated_by, notes
  )
  values (
    p_resource_id, p_quantity, p_patient_id, p_bed_id, p_allocated_by, p_notes
  )
  returning * into new_allocation;

  update resources
  set available_quantity = available_quantity - p_quantity,
      updated_at = now()
  where id = p_resource_id;

  insert into resource_transactions (
    resource_id, allocation_id, transaction_type, quantity, performed_by, notes
  )
  values (
    p_resource_id, new_allocation.id, 'allocate', p_quantity, p_allocated_by, p_notes
  );

  return to_jsonb(new_allocation);
end;
$$;

create or replace function release_resource_allocation(
  p_allocation_id uuid,
  p_released_by uuid,
  p_notes text default null
)
returns jsonb
language plpgsql
security definer
as $$
declare
  selected_allocation resource_allocations%rowtype;
begin
  select * into selected_allocation
  from resource_allocations
  where id = p_allocation_id
  for update;

  if not found then
    raise exception 'Resource allocation not found';
  end if;

  if selected_allocation.status <> 'active' then
    raise exception 'Resource allocation is already closed';
  end if;

  perform 1
  from resources
  where id = selected_allocation.resource_id
  for update;

  update resource_allocations
  set status = 'released',
      released_at = now(),
      notes = case
        when p_notes is null or btrim(p_notes) = '' then notes
        when notes is null or btrim(notes) = '' then p_notes
        else notes || E'\nRelease: ' || p_notes
      end
  where id = p_allocation_id
  returning * into selected_allocation;

  update resources
  set available_quantity = available_quantity + selected_allocation.quantity,
      updated_at = now()
  where id = selected_allocation.resource_id;

  insert into resource_transactions (
    resource_id, allocation_id, transaction_type, quantity, performed_by, notes
  )
  values (
    selected_allocation.resource_id,
    selected_allocation.id,
    'release',
    selected_allocation.quantity,
    p_released_by,
    p_notes
  );

  return to_jsonb(selected_allocation);
end;
$$;


-- ------------------------------------------------------------------
-- DIGITAL TOKEN & QR QUEUE SYSTEM
-- ------------------------------------------------------------------

