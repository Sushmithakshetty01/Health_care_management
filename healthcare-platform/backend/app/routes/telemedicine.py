from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..db import supabase

router = APIRouter(
    prefix="/telemedicine",
    tags=["Telemedicine"]
)


# --------------------------------------------------
# MODELS
# --------------------------------------------------

class AppointmentCreate(BaseModel):
    patient_name: str
    department: str
    doctor_name: str
    appointment_date: str
    appointment_time: str
    reason: str


class PrescriptionCreate(BaseModel):
    appointment_id: str
    medicine: str
    dosage: str
    duration: str
    instructions: str


class ReportCreate(BaseModel):
    appointment_id: str
    report_name: str
    report_url: str

class AppointmentStatusUpdate(BaseModel):
    status: str


# --------------------------------------------------
# ANALYTICS
# --------------------------------------------------

@router.get("/analytics")
def analytics():

    appointments = (
        supabase
        .table("telemedicine_appointments")
        .select("id")
        .execute()
    )

    reports = (
        supabase
        .table("telemedicine_reports")
        .select("id")
        .execute()
    )

    prescriptions = (
        supabase
        .table("telemedicine_prescriptions")
        .select("id")
        .execute()
    )

    return {
        "consultations": len(appointments.data or []),
        "reports": len(reports.data or []),
        "prescriptions": len(prescriptions.data or [])
    }


# --------------------------------------------------
# APPOINTMENTS
# --------------------------------------------------

@router.post("/appointments")
def create_appointment(payload: AppointmentCreate):

    result = (
        supabase
        .table("telemedicine_appointments")
        .insert(payload.model_dump())
        .execute()
    )

    return {
        "message": "Appointment created",
        "data": result.data
    }


@router.get("/appointments")
def get_appointments():

    result = (
        supabase
        .table("telemedicine_appointments")
        .select("*")
        .order("created_at", desc=True)
        .execute()
    )

    return result.data


# --------------------------------------------------
# REPORTS
# --------------------------------------------------

@router.post("/reports")
def create_report(payload: ReportCreate):

    result = (
        supabase
        .table("telemedicine_reports")
        .insert(payload.model_dump())
        .execute()
    )

    return {
        "message": "Report uploaded",
        "data": result.data
    }


@router.get("/reports")
def get_reports():

    result = (
        supabase
        .table("telemedicine_reports")
        .select("*")
        .order("uploaded_at", desc=True)
        .execute()
    )

    return result.data


# --------------------------------------------------
# PRESCRIPTIONS
# --------------------------------------------------

@router.post("/prescriptions")
def create_prescription(payload: PrescriptionCreate):

    result = (
        supabase
        .table("telemedicine_prescriptions")
        .insert(payload.model_dump())
        .execute()
    )

    return {
        "message": "Prescription created",
        "data": result.data
    }


@router.get("/prescriptions")
def get_prescriptions():

    result = (
        supabase
        .table("telemedicine_prescriptions")
        .select("*")
        .order("created_at", desc=True)
        .execute()
    )

    return result.data

@router.delete("/reports/{report_id}")
async def delete_report(report_id: str):
    result = (
        supabase.table("telemedicine_reports")
        .delete()
        .eq("id", report_id)
        .execute()
    )

    return {
        "success": True,
        "message": "Report deleted"
    }

@router.delete("/prescriptions/{prescription_id}")
async def delete_prescription(prescription_id: str):
    result = (
        supabase.table("telemedicine_prescriptions")
        .delete()
        .eq("id", prescription_id)
        .execute()
    )
    return {
        "success": True,
        "message": "Prescription deleted"
    }

@router.put("/appointments/{appointment_id}")
async def update_appointment_status(
    appointment_id: str,
    data: AppointmentStatusUpdate
):

    supabase.table("telemedicine_appointments") \
        .update({
            "status": data.status
        }) \
        .eq("id", appointment_id) \
        .execute()

    return {
        "success": True
    }