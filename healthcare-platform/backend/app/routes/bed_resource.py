from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field, model_validator

from ..auth import get_current_user
from ..db import supabase


router = APIRouter(prefix="/bed-resources", tags=["Bed and Resource Management"])

BED_STATUSES = {"available", "reserved", "occupied", "cleaning", "maintenance"}
RESOURCE_STATUSES = {"active", "maintenance", "inactive"}


def require_admin(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


def clean_optional(value: str | None) -> str | None:
    if value is None:
        return None
    cleaned = value.strip()
    return cleaned or None


def raise_database_error(error: Exception):
    message = str(error)
    lowered = message.lower()

    if "duplicate" in lowered or "unique" in lowered:
        raise HTTPException(status_code=409, detail="A record with these details already exists")
    if any(
        text in lowered
        for text in [
            "not found",
            "not available",
            "already",
            "insufficient",
            "negative",
            "greater than zero",
            "cannot be zero",
            "not active",
        ]
    ):
        raise HTTPException(status_code=409, detail=message)

    raise HTTPException(status_code=500, detail="Database operation failed")


class BedCreateRequest(BaseModel):
    bed_number: str = Field(min_length=1, max_length=50)
    ward_type: str = Field(min_length=1, max_length=100)
    room_number: str | None = Field(default=None, max_length=50)
    floor_number: int | None = Field(default=None, ge=0, le=200)
    status: str = "available"
    notes: str | None = Field(default=None, max_length=1000)


class BedUpdateRequest(BaseModel):
    bed_number: str | None = Field(default=None, min_length=1, max_length=50)
    ward_type: str | None = Field(default=None, min_length=1, max_length=100)
    room_number: str | None = Field(default=None, max_length=50)
    floor_number: int | None = Field(default=None, ge=0, le=200)
    notes: str | None = Field(default=None, max_length=1000)


class BedStatusRequest(BaseModel):
    status: str


class BedAssignRequest(BaseModel):
    patient_id: str
    expected_release_at: datetime | None = None
    notes: str | None = Field(default=None, max_length=1000)


class BedReleaseRequest(BaseModel):
    notes: str | None = Field(default=None, max_length=1000)


class ResourceCreateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    resource_type: str = Field(min_length=1, max_length=100)
    total_quantity: int = Field(ge=0)
    available_quantity: int | None = Field(default=None, ge=0)
    unit: str = Field(default="units", min_length=1, max_length=30)
    location: str | None = Field(default=None, max_length=120)
    minimum_threshold: int = Field(default=0, ge=0)
    status: str = "active"
    notes: str | None = Field(default=None, max_length=1000)

    @model_validator(mode="after")
    def validate_quantities(self):
        available = (
            self.total_quantity
            if self.available_quantity is None
            else self.available_quantity
        )
        if available > self.total_quantity:
            raise ValueError("Available quantity cannot exceed total quantity")
        return self


class ResourceUpdateRequest(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    resource_type: str | None = Field(default=None, min_length=1, max_length=100)
    unit: str | None = Field(default=None, min_length=1, max_length=30)
    location: str | None = Field(default=None, max_length=120)
    minimum_threshold: int | None = Field(default=None, ge=0)
    status: str | None = None
    notes: str | None = Field(default=None, max_length=1000)


class ResourceAdjustmentRequest(BaseModel):
    quantity_change: int
    notes: str = Field(min_length=2, max_length=1000)


class ResourceAllocateRequest(BaseModel):
    quantity: int = Field(gt=0)
    patient_id: str | None = None
    bed_id: str | None = None
    notes: str | None = Field(default=None, max_length=1000)


class ResourceReleaseRequest(BaseModel):
    notes: str | None = Field(default=None, max_length=1000)


@router.get("/summary")
def get_summary(current_user: dict = Depends(get_current_user)):
    beds_result = (
        supabase.table("beds").select("id, status, ward_type").execute()
    )
    resources_result = (
        supabase
        .table("resources")
        .select(
            "id, name, resource_type, total_quantity, available_quantity, "
            "minimum_threshold, status"
        )
        .execute()
    )

    beds = beds_result.data or []
    resources = resources_result.data or []
    bed_counts = {status: 0 for status in BED_STATUSES}
    ward_breakdown = {}

    for bed in beds:
        status = bed.get("status") or "available"
        bed_counts[status] = bed_counts.get(status, 0) + 1
        ward = bed.get("ward_type") or "Unassigned"
        ward_data = ward_breakdown.setdefault(
            ward,
            {"ward_type": ward, "total": 0, "available": 0, "occupied": 0},
        )
        ward_data["total"] += 1
        if status == "available":
            ward_data["available"] += 1
        if status == "occupied":
            ward_data["occupied"] += 1

    total_beds = len(beds)
    occupied = bed_counts.get("occupied", 0)
    resource_type_breakdown = {}

    for resource in resources:
        resource_type = resource.get("resource_type") or "other"
        item = resource_type_breakdown.setdefault(
            resource_type,
            {"resource_type": resource_type, "total": 0, "available": 0},
        )
        item["total"] += int(resource.get("total_quantity") or 0)
        item["available"] += int(resource.get("available_quantity") or 0)

    low_stock = [
        resource
        for resource in resources
        if int(resource.get("available_quantity") or 0)
        <= int(resource.get("minimum_threshold") or 0)
    ]

    return {
        "beds": {
            "total": total_beds,
            **bed_counts,
            "occupancy_percentage": (
                round((occupied / total_beds) * 100) if total_beds else 0
            ),
        },
        "resources": {
            "total_types": len(resources),
            "total_quantity": sum(
                int(resource.get("total_quantity") or 0) for resource in resources
            ),
            "available_quantity": sum(
                int(resource.get("available_quantity") or 0)
                for resource in resources
            ),
            "low_stock_count": len(low_stock),
            "low_stock": low_stock,
            "type_breakdown": sorted(
                resource_type_breakdown.values(),
                key=lambda item: item["resource_type"],
            ),
        },
        "ward_breakdown": sorted(
            ward_breakdown.values(),
            key=lambda item: item["ward_type"],
        ),
    }


@router.get("/patients")
def list_patients(
    search: str = Query(default="", max_length=120),
    admin: dict = Depends(require_admin),
):
    query = (
        supabase
        .table("app_users")
        .select("id, full_name, email")
        .eq("role", "user")
    )
    if search.strip():
        query = query.ilike("full_name", f"%{search.strip()}%")
    return query.order("full_name").limit(100).execute().data or []


@router.get("/beds")
def list_beds(
    status: str | None = None,
    ward_type: str | None = None,
    search: str = Query(default="", max_length=100),
    current_user: dict = Depends(get_current_user),
):
    if status and status not in BED_STATUSES:
        raise HTTPException(status_code=400, detail="Invalid bed status")

    query = (
        supabase
        .table("beds")
        .select(
            "id, bed_number, ward_type, room_number, floor_number, status, "
            "patient_id, assigned_at, expected_release_at, notes, created_at, "
            "updated_at, app_users(full_name, email)"
        )
    )
    if status:
        query = query.eq("status", status)
    if ward_type:
        query = query.eq("ward_type", ward_type)
    if search.strip():
        query = query.ilike("bed_number", f"%{search.strip()}%")

    return query.order("bed_number").execute().data or []


@router.post("/beds", status_code=201)
def create_bed(payload: BedCreateRequest, admin: dict = Depends(require_admin)):
    if payload.status not in BED_STATUSES or payload.status == "occupied":
        raise HTTPException(
            status_code=400,
            detail="New bed status must be available, reserved, cleaning or maintenance",
        )

    try:
        result = (
            supabase
            .table("beds")
            .insert({
                "bed_number": payload.bed_number.strip(),
                "ward_type": payload.ward_type.strip(),
                "room_number": clean_optional(payload.room_number),
                "floor_number": payload.floor_number,
                "status": payload.status,
                "notes": clean_optional(payload.notes),
            })
            .execute()
        )
    except Exception as error:
        raise_database_error(error)

    if not result.data:
        raise HTTPException(status_code=500, detail="Could not create bed")
    return {"message": "Bed created successfully", "bed": result.data[0]}


@router.patch("/beds/{bed_id}")
def update_bed(
    bed_id: str,
    payload: BedUpdateRequest,
    admin: dict = Depends(require_admin),
):
    update_data = payload.model_dump(exclude_unset=True)
    for key in ["bed_number", "ward_type", "room_number", "notes"]:
        if key in update_data:
            update_data[key] = clean_optional(update_data[key])

    if not update_data:
        raise HTTPException(status_code=400, detail="No update data provided")
    update_data["updated_at"] = datetime.utcnow().isoformat()

    try:
        result = (
            supabase.table("beds").update(update_data).eq("id", bed_id).execute()
        )
    except Exception as error:
        raise_database_error(error)

    if not result.data:
        raise HTTPException(status_code=404, detail="Bed not found")
    return {"message": "Bed updated successfully", "bed": result.data[0]}


@router.patch("/beds/{bed_id}/status")
def update_bed_status(
    bed_id: str,
    payload: BedStatusRequest,
    admin: dict = Depends(require_admin),
):
    if payload.status not in BED_STATUSES:
        raise HTTPException(status_code=400, detail="Invalid bed status")
    if payload.status == "occupied":
        raise HTTPException(
            status_code=400,
            detail="Use the assign endpoint to mark a bed occupied",
        )

    existing = (
        supabase.table("beds").select("id, status").eq("id", bed_id).limit(1).execute()
    )
    if not existing.data:
        raise HTTPException(status_code=404, detail="Bed not found")
    if existing.data[0]["status"] == "occupied":
        raise HTTPException(
            status_code=409,
            detail="Release the active patient before changing bed status",
        )

    result = (
        supabase
        .table("beds")
        .update({"status": payload.status, "updated_at": datetime.utcnow().isoformat()})
        .eq("id", bed_id)
        .execute()
    )
    return {"message": "Bed status updated", "bed": result.data[0]}


@router.post("/beds/{bed_id}/assign")
def assign_patient_to_bed(
    bed_id: str,
    payload: BedAssignRequest,
    admin: dict = Depends(require_admin),
):
    patient = (
        supabase
        .table("app_users")
        .select("id, role")
        .eq("id", payload.patient_id)
        .limit(1)
        .execute()
    )
    if not patient.data or patient.data[0].get("role") != "user":
        raise HTTPException(status_code=404, detail="Patient not found")

    try:
        result = (
            supabase
            .rpc("assign_bed", {
                "p_bed_id": bed_id,
                "p_patient_id": payload.patient_id,
                "p_assigned_by": admin["id"],
                "p_expected_release_at": (
                    payload.expected_release_at.isoformat()
                    if payload.expected_release_at
                    else None
                ),
                "p_notes": clean_optional(payload.notes),
            })
            .execute()
        )
    except Exception as error:
        raise_database_error(error)

    return {"message": "Patient assigned to bed", "assignment": result.data}


@router.post("/beds/{bed_id}/release")
def release_patient_from_bed(
    bed_id: str,
    payload: BedReleaseRequest,
    admin: dict = Depends(require_admin),
):
    try:
        result = (
            supabase
            .rpc("release_bed", {
                "p_bed_id": bed_id,
                "p_released_by": admin["id"],
                "p_notes": clean_optional(payload.notes),
            })
            .execute()
        )
    except Exception as error:
        raise_database_error(error)

    return {
        "message": "Bed released and moved to cleaning",
        "assignment": result.data,
    }


@router.get("/assignments")
def list_bed_assignments(admin: dict = Depends(require_admin)):
    result = (
        supabase
        .table("bed_assignments")
        .select(
            "id, admitted_at, expected_release_at, released_at, status, notes, "
            "beds(bed_number, ward_type), "
            "patient:app_users!bed_assignments_patient_id_fkey(full_name, email), "
            "assigned_by_user:app_users!bed_assignments_assigned_by_fkey(full_name)"
        )
        .order("created_at", desc=True)
        .limit(200)
        .execute()
    )
    return result.data or []


@router.get("/resources")
def list_resources(
    resource_type: str | None = None,
    status: str | None = None,
    search: str = Query(default="", max_length=100),
    current_user: dict = Depends(get_current_user),
):
    if status and status not in RESOURCE_STATUSES:
        raise HTTPException(status_code=400, detail="Invalid resource status")

    query = (
        supabase
        .table("resources")
        .select(
            "id, name, resource_type, total_quantity, available_quantity, unit, "
            "location, minimum_threshold, status, notes, created_at, updated_at"
        )
    )
    if resource_type:
        query = query.eq("resource_type", resource_type)
    if status:
        query = query.eq("status", status)
    if search.strip():
        query = query.ilike("name", f"%{search.strip()}%")

    return query.order("name").execute().data or []


@router.post("/resources", status_code=201)
def create_resource(
    payload: ResourceCreateRequest,
    admin: dict = Depends(require_admin),
):
    if payload.status not in RESOURCE_STATUSES:
        raise HTTPException(status_code=400, detail="Invalid resource status")
    available = (
        payload.total_quantity
        if payload.available_quantity is None
        else payload.available_quantity
    )

    try:
        result = (
            supabase
            .table("resources")
            .insert({
                "name": payload.name.strip(),
                "resource_type": payload.resource_type.strip().lower(),
                "total_quantity": payload.total_quantity,
                "available_quantity": available,
                "unit": payload.unit.strip(),
                "location": clean_optional(payload.location),
                "minimum_threshold": payload.minimum_threshold,
                "status": payload.status,
                "notes": clean_optional(payload.notes),
            })
            .execute()
        )
    except Exception as error:
        raise_database_error(error)

    if not result.data:
        raise HTTPException(status_code=500, detail="Could not create resource")
    return {
        "message": "Resource created successfully",
        "resource": result.data[0],
    }


@router.patch("/resources/{resource_id}")
def update_resource(
    resource_id: str,
    payload: ResourceUpdateRequest,
    admin: dict = Depends(require_admin),
):
    update_data = payload.model_dump(exclude_unset=True)
    if update_data.get("status") and update_data["status"] not in RESOURCE_STATUSES:
        raise HTTPException(status_code=400, detail="Invalid resource status")

    for key in ["name", "resource_type", "unit", "location", "notes"]:
        if key in update_data:
            update_data[key] = clean_optional(update_data[key])
    if update_data.get("resource_type"):
        update_data["resource_type"] = update_data["resource_type"].lower()

    if not update_data:
        raise HTTPException(status_code=400, detail="No update data provided")
    update_data["updated_at"] = datetime.utcnow().isoformat()

    try:
        result = (
            supabase
            .table("resources")
            .update(update_data)
            .eq("id", resource_id)
            .execute()
        )
    except Exception as error:
        raise_database_error(error)

    if not result.data:
        raise HTTPException(status_code=404, detail="Resource not found")
    return {"message": "Resource updated", "resource": result.data[0]}


@router.post("/resources/{resource_id}/adjust")
def adjust_resource(
    resource_id: str,
    payload: ResourceAdjustmentRequest,
    admin: dict = Depends(require_admin),
):
    if payload.quantity_change == 0:
        raise HTTPException(status_code=400, detail="Quantity change cannot be zero")

    try:
        result = (
            supabase
            .rpc("adjust_resource_stock", {
                "p_resource_id": resource_id,
                "p_quantity_change": payload.quantity_change,
                "p_performed_by": admin["id"],
                "p_notes": payload.notes.strip(),
            })
            .execute()
        )
    except Exception as error:
        raise_database_error(error)

    return {"message": "Resource stock adjusted", "resource": result.data}


@router.post("/resources/{resource_id}/allocate")
def allocate_resource_to_patient(
    resource_id: str,
    payload: ResourceAllocateRequest,
    admin: dict = Depends(require_admin),
):
    if not payload.patient_id and not payload.bed_id:
        raise HTTPException(
            status_code=400,
            detail="Patient or bed is required for allocation",
        )

    try:
        result = (
            supabase
            .rpc("allocate_resource", {
                "p_resource_id": resource_id,
                "p_quantity": payload.quantity,
                "p_allocated_by": admin["id"],
                "p_patient_id": payload.patient_id,
                "p_bed_id": payload.bed_id,
                "p_notes": clean_optional(payload.notes),
            })
            .execute()
        )
    except Exception as error:
        raise_database_error(error)

    return {"message": "Resource allocated successfully", "allocation": result.data}


@router.post("/allocations/{allocation_id}/release")
def release_resource(
    allocation_id: str,
    payload: ResourceReleaseRequest,
    admin: dict = Depends(require_admin),
):
    try:
        result = (
            supabase
            .rpc("release_resource_allocation", {
                "p_allocation_id": allocation_id,
                "p_released_by": admin["id"],
                "p_notes": clean_optional(payload.notes),
            })
            .execute()
        )
    except Exception as error:
        raise_database_error(error)

    return {"message": "Resource returned to inventory", "allocation": result.data}


@router.get("/allocations")
def list_resource_allocations(
    active_only: bool = False,
    admin: dict = Depends(require_admin),
):
    query = (
        supabase
        .table("resource_allocations")
        .select(
            "id, quantity, allocated_at, released_at, status, notes, "
            "resources(name, resource_type, unit), beds(bed_number), "
            "patient:app_users!resource_allocations_patient_id_fkey(full_name, email), "
            "allocated_by_user:app_users!resource_allocations_allocated_by_fkey(full_name)"
        )
    )
    if active_only:
        query = query.eq("status", "active")
    return query.order("created_at", desc=True).limit(200).execute().data or []


@router.get("/transactions")
def list_resource_transactions(admin: dict = Depends(require_admin)):
    result = (
        supabase
        .table("resource_transactions")
        .select(
            "id, transaction_type, quantity, notes, created_at, "
            "resources(name, resource_type, unit), "
            "performed_by_user:app_users!resource_transactions_performed_by_fkey(full_name)"
        )
        .order("created_at", desc=True)
        .limit(200)
        .execute()
    )
    return result.data or []
