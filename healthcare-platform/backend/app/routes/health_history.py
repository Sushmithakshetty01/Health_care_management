from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from ..db import supabase
from ..auth import get_current_user


router = APIRouter(prefix="/health-history", tags=["Health History"])


class HealthHistoryRequest(BaseModel):
    record_type: str
    title: str
    description: str
    doctor_name: str | None = None
    department: str | None = None
    visit_date: str | None = None
    prescription: str | None = None
    allergies: str | None = None
    chronic_conditions: str | None = None
    report_notes: str | None = None


@router.post("/records")
def create_health_record(
    payload: HealthHistoryRequest,
    current_user: dict = Depends(get_current_user),
):
    allowed_types = [
        "visit",
        "prescription",
        "allergy",
        "report",
        "chronic_condition",
        "general",
    ]

    if payload.record_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid record type")

    result = (
        supabase
        .table("health_history_records")
        .insert({
            "user_id": current_user["id"],
            "record_type": payload.record_type,
            "title": payload.title.strip(),
            "description": payload.description.strip(),
            "doctor_name": payload.doctor_name,
            "department": payload.department,
            "visit_date": payload.visit_date,
            "prescription": payload.prescription,
            "allergies": payload.allergies,
            "chronic_conditions": payload.chronic_conditions,
            "report_notes": payload.report_notes,
        })
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=500, detail="Could not create health record")

    return {
        "message": "Health history record created successfully",
        "record": result.data[0],
    }


@router.get("/my-records")
def get_my_health_records(current_user: dict = Depends(get_current_user)):
    result = (
        supabase
        .table("health_history_records")
        .select(
            "id, record_type, title, description, doctor_name, department, "
            "visit_date, prescription, allergies, chronic_conditions, "
            "report_notes, created_at"
        )
        .eq("user_id", current_user["id"])
        .order("created_at", desc=True)
        .execute()
    )

    return result.data or []


@router.delete("/records/{record_id}")
def delete_my_health_record(
    record_id: str,
    current_user: dict = Depends(get_current_user),
):
    existing = (
        supabase
        .table("health_history_records")
        .select("id")
        .eq("id", record_id)
        .eq("user_id", current_user["id"])
        .limit(1)
        .execute()
    )

    if not existing.data:
        raise HTTPException(status_code=404, detail="Health record not found")

    (
        supabase
        .table("health_history_records")
        .delete()
        .eq("id", record_id)
        .execute()
    )

    return {"message": "Health record deleted successfully"}


@router.get("/admin/records")
def get_all_health_records(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    result = (
        supabase
        .table("health_history_records")
        .select(
            "id, record_type, title, description, doctor_name, department, "
            "visit_date, prescription, allergies, chronic_conditions, "
            "report_notes, created_at, app_users(full_name, email)"
        )
        .order("created_at", desc=True)
        .limit(200)
        .execute()
    )

    return result.data or []


@router.get("/admin/summary")
def get_health_history_summary(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    result = (
        supabase
        .table("health_history_records")
        .select("record_type, department")
        .execute()
    )

    records = result.data or []

    type_counts = {}
    department_counts = {}

    for record in records:
        record_type = record.get("record_type") or "unknown"
        department = record.get("department") or "Unassigned"

        type_counts[record_type] = type_counts.get(record_type, 0) + 1
        department_counts[department] = department_counts.get(department, 0) + 1

    return {
        "total_records": len(records),
        "record_type_breakdown": type_counts,
        "department_breakdown": department_counts,
    }