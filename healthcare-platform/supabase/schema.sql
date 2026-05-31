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
