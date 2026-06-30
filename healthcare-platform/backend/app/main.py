from fastapi.middleware.cors import CORSMiddleware
import os
import smtplib
from email.message import EmailMessage
from datetime import datetime, timezone, timedelta
from app.routes.pharmacy import router as pharmacy_router
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from .db import supabase
from .models import SignupRequest, LoginRequest, AuthResponse, SymptomSubmitRequest
from .routes.patient_feedback import router as patient_feedback_router
from .routes.voice_assistant import router as voice_assistant_router
from .routes.disease_risk import router as disease_risk_router
from .routes.health_history import router as health_history_router
from .routes.bed_resource import router as bed_resource_router
from .routes.digital_token import router as digital_token_router
from .routes.telemedicine import router as telemedicine_router




from .auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
)

load_dotenv()

app = FastAPI(title="Smart Healthcare Queue API", version="1.0.0")
app.include_router(pharmacy_router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(patient_feedback_router)
app.include_router(voice_assistant_router)
app.include_router(disease_risk_router)
app.include_router(health_history_router)
app.include_router(bed_resource_router)
app.include_router(digital_token_router)
app.include_router(telemedicine_router)

# -------------------------------------------------------------------
# REQUEST MODELS
# -------------------------------------------------------------------

class DoctorCreateRequest(BaseModel):
    full_name: str
    department_id: str
    specialization: str | None = None
    consultation_minutes: int = 15
    is_available: bool = True
    current_patient_count: int = 0


class DoctorUpdateRequest(BaseModel):
    full_name: str | None = None
    specialization: str | None = None
    consultation_minutes: int | None = None
    is_available: bool | None = None
    current_patient_count: int | None = None


class AppointmentRequest(BaseModel):
    doctor_id: str
    department_id: str
    appointment_date: str
    appointment_time: str
    reason: str | None = None


# -------------------------------------------------------------------
# HELPERS
# -------------------------------------------------------------------

def require_admin(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


def send_email(to_email: str, subject: str, body: str):
    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")
    smtp_from = os.getenv("SMTP_FROM") or smtp_user

    if not smtp_host or not smtp_user or not smtp_password:
        print("SMTP not configured. Skipping email.")
        return False

    try:
        msg = EmailMessage()
        msg["Subject"] = subject
        msg["From"] = smtp_from
        msg["To"] = to_email
        msg.set_content(body)

        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.send_message(msg)

        return True

    except Exception as e:
        print("Email sending failed:", str(e))
        return False


def calculate_wait_values(
    urgency: str,
    patients_before: int,
    consult_minutes: int,
    note_prefix: str = "Doctor queue calculation",
):
    base_wait = patients_before * consult_minutes
    buffer_minutes = 10

    if urgency == "Critical":
        priority_wait = 2
        priority_adjustment = max(base_wait - priority_wait, 0)
        estimated_wait_minutes = priority_wait + buffer_minutes

    elif urgency == "High":
        priority_wait = max(5, base_wait // 3)
        priority_adjustment = max(base_wait - priority_wait, 0)
        estimated_wait_minutes = priority_wait + buffer_minutes

    elif urgency == "Medium":
        priority_wait = max(10, base_wait // 2)
        priority_adjustment = max(base_wait - priority_wait, 0)
        estimated_wait_minutes = priority_wait + buffer_minutes

    else:
        priority_wait = max(15, base_wait)
        priority_adjustment = 0
        estimated_wait_minutes = priority_wait + buffer_minutes

    calculation_note = (
        f"{note_prefix}: {patients_before} patients are before this patient. "
        f"Consultation time is {consult_minutes} minutes per patient. "
        f"Base wait = {patients_before} Ã— {consult_minutes} = {base_wait} minutes. "
        f"Urgency level is {urgency}. "
        f"Priority-adjusted wait = {priority_wait} minutes. "
        f"Priority adjustment = {priority_adjustment} minutes. "
        f"Buffer time = {buffer_minutes} minutes. "
        f"Final wait time = {estimated_wait_minutes} minutes."
    )

    return {
        "base_wait": base_wait,
        "buffer_minutes": buffer_minutes,
        "priority_adjustment": priority_adjustment,
        "estimated_wait_minutes": estimated_wait_minutes,
        "calculation_note": calculation_note,
    }


def get_best_doctor_for_department(department_id: str):
    doctor_result = (
        supabase
        .table("doctors")
        .select(
            "id, full_name, consultation_minutes, current_patient_count, is_available"
        )
        .eq("department_id", department_id)
        .eq("is_available", True)
        .order("current_patient_count")
        .limit(1)
        .execute()
    )

    if doctor_result.data:
        return doctor_result.data[0]

    fallback_result = (
        supabase
        .table("doctors")
        .select(
            "id, full_name, consultation_minutes, current_patient_count, is_available"
        )
        .eq("is_available", True)
        .order("current_patient_count")
        .limit(1)
        .execute()
    )

    if fallback_result.data:
        return fallback_result.data[0]

    return None


def recalculate_doctor_queue(doctor_id: str):
    doctor_result = (
        supabase
        .table("doctors")
        .select("id, consultation_minutes, current_patient_count")
        .eq("id", doctor_id)
        .limit(1)
        .execute()
    )

    if not doctor_result.data:
        return

    doctor = doctor_result.data[0]
    consult_minutes = int(doctor.get("consultation_minutes") or 15)
    admin_patient_count = int(doctor.get("current_patient_count") or 0)

    waiting_result = (
        supabase
        .table("queue_entries")
        .select("id, urgency, queue_number")
        .eq("doctor_id", doctor_id)
        .eq("status", "waiting")
        .order("queue_number")
        .execute()
    )

    waiting_entries = waiting_result.data or []

    for index, entry in enumerate(waiting_entries):
        patients_before = admin_patient_count + index

        values = calculate_wait_values(
            urgency=entry["urgency"],
            patients_before=patients_before,
            consult_minutes=consult_minutes,
            note_prefix="After admin queue update",
        )

        (
            supabase
            .table("queue_entries")
            .update({
                "estimated_wait_minutes": values["estimated_wait_minutes"],
                "base_wait_minutes": values["base_wait"],
                "buffer_minutes": values["buffer_minutes"],
                "priority_adjustment_minutes": values["priority_adjustment"],
                "calculation_note": values["calculation_note"],
            })
            .eq("id", entry["id"])
            .execute()
        )


# -------------------------------------------------------------------
# ROOT
# -------------------------------------------------------------------

@app.get("/")
def root():
    return {
        "status": "ok",
        "service": "Smart Healthcare Queue API",
    }


# -------------------------------------------------------------------
# AUTH
# -------------------------------------------------------------------

@app.post("/auth/signup", response_model=AuthResponse)
def signup(payload: SignupRequest):
    role = payload.role if payload.role in ["user", "admin"] else "user"

    existing = (
        supabase
        .table("app_users")
        .select("id")
        .eq("email", payload.email.lower())
        .execute()
    )

    if existing.data:
        raise HTTPException(status_code=409, detail="Email already registered")

    inserted = (
        supabase
        .table("app_users")
        .insert({
            "full_name": payload.full_name.strip(),
            "email": payload.email.lower(),
            "password_hash": hash_password(payload.password),
            "role": role,
        })
        .execute()
    )

    if not inserted.data:
        raise HTTPException(status_code=500, detail="Could not create user")

    user = inserted.data[0]

    safe_user = {
        "id": user["id"],
        "full_name": user["full_name"],
        "email": user["email"],
        "role": user["role"],
    }

    return {
        "access_token": create_access_token(safe_user),
        "token_type": "bearer",
        "user": safe_user,
    }


@app.post("/auth/login", response_model=AuthResponse)
def login(payload: LoginRequest):
    result = (
        supabase
        .table("app_users")
        .select("id, full_name, email, role, password_hash")
        .eq("email", payload.email.lower())
        .limit(1)
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    user = result.data[0]

    if not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    safe_user = {
        "id": user["id"],
        "full_name": user["full_name"],
        "email": user["email"],
        "role": user["role"],
    }

    return {
        "access_token": create_access_token(safe_user),
        "token_type": "bearer",
        "user": safe_user,
    }


@app.get("/auth/me")
def me(current_user: dict = Depends(get_current_user)):
    return current_user


# -------------------------------------------------------------------
# SYMPTOMS
# -------------------------------------------------------------------

@app.get("/symptoms")
def symptoms(q: str = ""):
    query = (
        supabase
        .table("symptoms")
        .select("id, name, department, severity_weight")
    )

    if q:
        query = query.ilike("name", f"%{q}%")

    result = query.order("name").limit(30).execute()
    return result.data or []


@app.post("/symptom-submissions")
def submit_symptoms(
    payload: SymptomSubmitRequest,
    current_user: dict = Depends(get_current_user),
):
    symptoms_result = (
        supabase
        .table("symptoms")
        .select("id, name, department, severity_weight")
        .in_("id", payload.symptom_ids)
        .execute()
    )

    selected = symptoms_result.data or []

    if not selected:
        raise HTTPException(status_code=400, detail="No valid symptoms selected")

    total_score = sum(int(s.get("severity_weight", 1)) for s in selected)

    highest_symptom = max(
        selected,
        key=lambda s: int(s.get("severity_weight", 1)),
    )

    recommended_department_name = highest_symptom.get(
        "department",
        "General Medicine",
    )

    if total_score >= 12:
        urgency = "Critical"
    elif total_score >= 8:
        urgency = "High"
    elif total_score >= 5:
        urgency = "Medium"
    else:
        urgency = "Low"

    department_result = (
        supabase
        .table("departments")
        .select("id, name")
        .eq("name", recommended_department_name)
        .limit(1)
        .execute()
    )

    if department_result.data:
        department = department_result.data[0]
    else:
        fallback_department_result = (
            supabase
            .table("departments")
            .select("id, name")
            .eq("name", "General Medicine")
            .limit(1)
            .execute()
        )

        if not fallback_department_result.data:
            raise HTTPException(
                status_code=500,
                detail="No matching department found. Please seed departments table.",
            )

        department = fallback_department_result.data[0]

    doctor = get_best_doctor_for_department(department["id"])

    if not doctor:
        raise HTTPException(
            status_code=400,
            detail="No doctor available right now. Admin must add available doctors.",
        )

    current_count = int(doctor.get("current_patient_count") or 0)
    consult_minutes = int(doctor.get("consultation_minutes") or 15)

    values = calculate_wait_values(
        urgency=urgency,
        patients_before=current_count,
        consult_minutes=consult_minutes,
        note_prefix="Initial queue calculation",
    )

    submission_insert = (
        supabase
        .table("symptom_submissions")
        .insert({
            "user_id": current_user["id"],
            "symptom_ids": payload.symptom_ids,
            "age": payload.age,
            "gender": payload.gender,
            "notes": payload.notes,
            "urgency": urgency,
            "recommended_department": department["name"],
            "estimated_wait_minutes": values["estimated_wait_minutes"],
        })
        .execute()
    )

    if not submission_insert.data:
        raise HTTPException(status_code=500, detail="Could not save symptom submission")

    queue_count_result = (
        supabase
        .table("queue_entries")
        .select("id")
        .execute()
    )

    queue_number = len(queue_count_result.data or []) + 1

    queue_insert = (
        supabase
        .table("queue_entries")
        .insert({
            "user_id": current_user["id"],
            "department_id": department["id"],
            "doctor_id": doctor["id"],
            "symptom_submission_id": submission_insert.data[0]["id"],
            "urgency": urgency,
            "queue_number": queue_number,
            "estimated_wait_minutes": values["estimated_wait_minutes"],
            "base_wait_minutes": values["base_wait"],
            "buffer_minutes": values["buffer_minutes"],
            "priority_adjustment_minutes": values["priority_adjustment"],
            "calculation_note": values["calculation_note"],
            "appointment_confirmed": False,
            "status": "waiting",
        })
        .execute()
    )

    if not queue_insert.data:
        raise HTTPException(status_code=500, detail="Could not create queue entry")

    return {
        "message": "Symptoms submitted successfully",
        "submission": submission_insert.data[0],
        "triage": {
            "urgency": urgency,
            "recommended_department": department["name"],
            "assigned_doctor": doctor["full_name"],
            "estimated_wait_minutes": values["estimated_wait_minutes"],
            "base_wait_minutes": values["base_wait"],
            "buffer_minutes": values["buffer_minutes"],
            "priority_adjustment_minutes": values["priority_adjustment"],
            "calculation_note": values["calculation_note"],
            "queue_number": queue_number,
            "queue_token": f"Q-{queue_number}",
            "selected_symptoms": selected,
        },
        "urgency": urgency,
        "recommended_department": department["name"],
        "assigned_doctor": doctor["full_name"],
        "estimated_wait_minutes": values["estimated_wait_minutes"],
        "base_wait_minutes": values["base_wait"],
        "buffer_minutes": values["buffer_minutes"],
        "priority_adjustment_minutes": values["priority_adjustment"],
        "calculation_note": values["calculation_note"],
        "queue_number": queue_number,
        "queue_token": f"Q-{queue_number}",
        "selected_symptoms": selected,
    }


# -------------------------------------------------------------------
# DEPARTMENTS + DOCTORS
# -------------------------------------------------------------------

@app.get("/departments")
def get_departments():
    result = (
        supabase
        .table("departments")
        .select("id, name, description")
        .order("name")
        .execute()
    )

    return result.data or []


@app.get("/doctors")
def get_doctors():
    result = (
        supabase
        .table("doctors")
        .select(
            "id, full_name, specialization, consultation_minutes, "
            "is_available, current_patient_count, department_id, departments(name)"
        )
        .order("full_name")
        .execute()
    )

    return result.data or []


@app.post("/admin/doctors")
def create_doctor(
    payload: DoctorCreateRequest,
    admin: dict = Depends(require_admin),
):
    result = (
        supabase
        .table("doctors")
        .insert({
            "full_name": payload.full_name,
            "department_id": payload.department_id,
            "specialization": payload.specialization,
            "consultation_minutes": payload.consultation_minutes,
            "is_available": payload.is_available,
            "current_patient_count": payload.current_patient_count,
        })
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=500, detail="Could not add doctor")

    return {
        "message": "Doctor added successfully",
        "doctor": result.data[0],
    }


@app.patch("/admin/doctors/{doctor_id}")
def update_doctor(
    doctor_id: str,
    payload: DoctorUpdateRequest,
    admin: dict = Depends(require_admin),
):
    update_data = payload.model_dump(exclude_unset=True)

    if not update_data:
        raise HTTPException(status_code=400, detail="No update data provided")

    result = (
        supabase
        .table("doctors")
        .update(update_data)
        .eq("id", doctor_id)
        .execute()
    )

    return {
        "message": "Doctor updated successfully",
        "doctor": result.data[0] if result.data else None,
    }


@app.patch("/admin/doctors/{doctor_id}/availability")
def update_doctor_availability(
    doctor_id: str,
    is_available: bool,
    admin: dict = Depends(require_admin),
):
    result = (
        supabase
        .table("doctors")
        .update({"is_available": is_available})
        .eq("id", doctor_id)
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=404, detail="Doctor not found")

    return {
        "message": "Doctor availability updated",
        "doctor": result.data[0],
    }


@app.patch("/admin/doctors/{doctor_id}/patient-count")
def update_doctor_patient_count(
    doctor_id: str,
    current_patient_count: int,
    admin: dict = Depends(require_admin),
):
    if current_patient_count < 0:
        raise HTTPException(status_code=400, detail="Patient count cannot be negative")

    result = (
        supabase
        .table("doctors")
        .update({"current_patient_count": current_patient_count})
        .eq("id", doctor_id)
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=404, detail="Doctor not found")

    recalculate_doctor_queue(doctor_id)

    return {
        "message": "Doctor patient count updated and queue recalculated",
        "doctor": result.data[0],
    }


# -------------------------------------------------------------------
# QUEUE
# -------------------------------------------------------------------

@app.get("/queue/my")
def my_queue(current_user: dict = Depends(get_current_user)):
    result = (
        supabase
        .table("queue_entries")
        .select(
            "id, queue_number, urgency, estimated_wait_minutes, status, "
            "appointment_confirmed, confirmed_at, base_wait_minutes, buffer_minutes, "
            "priority_adjustment_minutes, calculation_note, created_at, "
            "doctors(full_name), departments(name)"
        )
        .eq("user_id", current_user["id"])
        .order("created_at", desc=True)
        .execute()
    )

    return result.data or []


@app.patch("/queue/{queue_id}/confirm")
def confirm_appointment(
    queue_id: str,
    current_user: dict = Depends(get_current_user),
):
    existing = (
        supabase
        .table("queue_entries")
        .select(
            "id, user_id, queue_number, urgency, estimated_wait_minutes, "
            "appointment_confirmed, doctors(full_name), departments(name)"
        )
        .eq("id", queue_id)
        .eq("user_id", current_user["id"])
        .limit(1)
        .execute()
    )

    if not existing.data:
        raise HTTPException(status_code=404, detail="Queue entry not found")

    queue = existing.data[0]

    result = (
        supabase
        .table("queue_entries")
        .update({
            "appointment_confirmed": True,
            "confirmed_at": datetime.now(timezone.utc).isoformat(),
        })
        .eq("id", queue_id)
        .execute()
    )

    user_result = (
        supabase
        .table("app_users")
        .select("full_name, email")
        .eq("id", current_user["id"])
        .limit(1)
        .execute()
    )

    email_sent = False

    if user_result.data:
        user = user_result.data[0]

        doctor_name = queue.get("doctors", {}).get("full_name", "Assigned Doctor")
        department_name = queue.get("departments", {}).get("name", "Assigned Department")

        email_body = f"""
Hello {user["full_name"]},

Your appointment has been confirmed.

Queue Token: Q-{queue["queue_number"]}
Department: {department_name}
Doctor: {doctor_name}
Urgency: {queue["urgency"]}
Estimated Waiting Time: {queue["estimated_wait_minutes"]} minutes

Please stay available and follow the queue updates in the MediFlow AI dashboard.

Regards,
MediFlow AI
Smart Hospital Operations
"""

        email_sent = send_email(
            to_email=user["email"],
            subject=f"Appointment Confirmed - Queue Token Q-{queue['queue_number']}",
            body=email_body,
        )

    return {
        "message": "Appointment confirmed successfully",
        "email_sent": email_sent,
        "sent_to": user_result.data[0]["email"] if user_result.data else None,
        "queue": result.data[0] if result.data else None,
    }


@app.get("/admin/queue")
def admin_queue(admin: dict = Depends(require_admin)):
    result = (
        supabase
        .table("queue_entries")
        .select(
            "id, queue_number, urgency, estimated_wait_minutes, status, "
            "appointment_confirmed, confirmed_at, base_wait_minutes, buffer_minutes, "
            "priority_adjustment_minutes, calculation_note, created_at, "
            "app_users(full_name, email), doctors(full_name), departments(name)"
        )
        .order("created_at", desc=True)
        .execute()
    )

    return result.data or []


@app.patch("/admin/queue/{queue_id}/status")
def update_queue_status(
    queue_id: str,
    status: str,
    admin: dict = Depends(require_admin),
):
    allowed = ["waiting", "in_consultation", "completed", "cancelled"]

    if status not in allowed:
        raise HTTPException(status_code=400, detail="Invalid status")

    existing_result = (
        supabase
        .table("queue_entries")
        .select("id, doctor_id, status")
        .eq("id", queue_id)
        .limit(1)
        .execute()
    )

    if not existing_result.data:
        raise HTTPException(status_code=404, detail="Queue entry not found")

    existing = existing_result.data[0]
    old_status = existing["status"]
    doctor_id = existing["doctor_id"]

    result = (
        supabase
        .table("queue_entries")
        .update({"status": status})
        .eq("id", queue_id)
        .execute()
    )

    if (
        doctor_id
        and status in ["completed", "cancelled"]
        and old_status not in ["completed", "cancelled"]
    ):
        doctor_result = (
            supabase
            .table("doctors")
            .select("id, current_patient_count")
            .eq("id", doctor_id)
            .limit(1)
            .execute()
        )

        if doctor_result.data:
            doctor = doctor_result.data[0]
            current_count = int(doctor.get("current_patient_count") or 0)

            (
                supabase
                .table("doctors")
                .update({
                    "current_patient_count": max(current_count - 1, 0)
                })
                .eq("id", doctor_id)
                .execute()
            )

        recalculate_doctor_queue(doctor_id)

    return {
        "message": "Queue status updated",
        "queue": result.data[0] if result.data else None,
    }


# -------------------------------------------------------------------
# ANALYTICS DASHBOARD
# -------------------------------------------------------------------

@app.get("/analytics/overview")
def analytics_overview(current_user: dict = Depends(get_current_user)):
    queue_result = (
        supabase
        .table("queue_entries")
        .select(
            "id, urgency, status, estimated_wait_minutes, created_at, "
            "appointment_confirmed, departments(name), doctors(full_name)"
        )
        .execute()
    )

    doctors_result = (
        supabase
        .table("doctors")
        .select(
            "id, full_name, consultation_minutes, current_patient_count, "
            "is_available, departments(name)"
        )
        .execute()
    )

    symptoms_result = (
        supabase
        .table("symptom_submissions")
        .select(
            "id, urgency, recommended_department, estimated_wait_minutes, created_at"
        )
        .execute()
    )

    queue_entries = queue_result.data or []
    doctors = doctors_result.data or []
    symptom_submissions = symptoms_result.data or []

    total_patients = len(queue_entries)

    waiting_count = len([q for q in queue_entries if q.get("status") == "waiting"])
    in_consultation_count = len([q for q in queue_entries if q.get("status") == "in_consultation"])
    completed_count = len([q for q in queue_entries if q.get("status") == "completed"])
    cancelled_count = len([q for q in queue_entries if q.get("status") == "cancelled"])

    high_priority_count = len([
        q for q in queue_entries
        if q.get("urgency") in ["High", "Critical"]
    ])

    confirmed_count = len([
        q for q in queue_entries
        if q.get("appointment_confirmed") is True
    ])

    wait_times = [
        int(q.get("estimated_wait_minutes") or 0)
        for q in queue_entries
        if q.get("estimated_wait_minutes") is not None
    ]

    average_wait_time = round(sum(wait_times) / len(wait_times)) if wait_times else 0

    active_doctors = len([d for d in doctors if d.get("is_available") is True])
    unavailable_doctors = len([d for d in doctors if d.get("is_available") is False])

    total_walkin_load = sum(int(d.get("current_patient_count") or 0) for d in doctors)

    average_consultation_time = (
        round(
            sum(int(d.get("consultation_minutes") or 0) for d in doctors)
            / len(doctors)
        )
        if doctors
        else 0
    )

    department_map = {}

    for doctor in doctors:
        department_name = (
            doctor.get("departments", {}).get("name")
            if doctor.get("departments")
            else "Unassigned"
        )

        if department_name not in department_map:
            department_map[department_name] = {
                "name": department_name,
                "patients": 0,
                "queue_patients": 0,
                "walkin_patients": 0,
                "wait_total": 0,
                "wait_count": 0,
                "doctor_count": 0,
                "active_doctors": 0,
                "load": 0,
            }

        department_map[department_name]["doctor_count"] += 1

        if doctor.get("is_available"):
            department_map[department_name]["active_doctors"] += 1

        walkins = int(doctor.get("current_patient_count") or 0)
        department_map[department_name]["patients"] += walkins
        department_map[department_name]["walkin_patients"] += walkins

    for queue in queue_entries:
        department_name = (
            queue.get("departments", {}).get("name")
            if queue.get("departments")
            else "Unassigned"
        )

        if department_name not in department_map:
            department_map[department_name] = {
                "name": department_name,
                "patients": 0,
                "queue_patients": 0,
                "walkin_patients": 0,
                "wait_total": 0,
                "wait_count": 0,
                "doctor_count": 0,
                "active_doctors": 0,
                "load": 0,
            }

        wait = int(queue.get("estimated_wait_minutes") or 0)

        department_map[department_name]["patients"] += 1
        department_map[department_name]["queue_patients"] += 1
        department_map[department_name]["wait_total"] += wait
        department_map[department_name]["wait_count"] += 1

    department_load = []

    for dept in department_map.values():
        patient_count = dept["patients"]
        doctor_count = max(dept["doctor_count"], 1)
        wait_count = dept["wait_count"]

        avg_wait = round(dept["wait_total"] / wait_count) if wait_count > 0 else 0

        load = min(
            100,
            round((patient_count / (doctor_count * 10)) * 100)
        )

        department_load.append({
            "name": dept["name"],
            "patients": patient_count,
            "queue_patients": dept["queue_patients"],
            "walkin_patients": dept["walkin_patients"],
            "wait": avg_wait,
            "average_wait_time": avg_wait,
            "load": load,
            "doctor_count": dept["doctor_count"],
            "active_doctors": dept["active_doctors"],
        })

    department_load = sorted(
        department_load,
        key=lambda item: item["patients"],
        reverse=True
    )

    department_wait_times = sorted(
        [
            {
                "name": dept["name"],
                "average_wait_time": dept["average_wait_time"],
                "patients": dept["patients"],
                "queue_patients": dept["queue_patients"],
            }
            for dept in department_load
        ],
        key=lambda item: item["average_wait_time"],
        reverse=True
    )

    highest_load = (
        max(department_load, key=lambda item: item["load"])
        if department_load
        else {
            "name": "No data",
            "load": 0,
            "patients": 0,
            "wait": 0,
        }
    )

    highest_wait_department = (
        max(department_wait_times, key=lambda item: item["average_wait_time"])
        if department_wait_times
        else {
            "name": "No data",
            "average_wait_time": 0,
            "patients": 0,
        }
    )

    doctor_workload = []

    for doctor in doctors:
        department_name = (
            doctor.get("departments", {}).get("name")
            if doctor.get("departments")
            else "Unassigned"
        )

        patient_count = int(doctor.get("current_patient_count") or 0)
        consult_minutes = int(doctor.get("consultation_minutes") or 0)
        base_wait = patient_count * consult_minutes

        doctor_workload.append({
            "name": doctor.get("full_name", "Doctor"),
            "department": department_name,
            "patient_count": patient_count,
            "consultation_minutes": consult_minutes,
            "base_wait": base_wait,
            "is_available": doctor.get("is_available") is True,
            "load": min(100, patient_count * 10),
        })

    doctor_workload = sorted(
        doctor_workload,
        key=lambda item: item["patient_count"],
        reverse=True
    )

    busiest_doctor = (
        doctor_workload[0]
        if doctor_workload
        else {
            "name": "No data",
            "department": "No data",
            "patient_count": 0,
            "base_wait": 0,
            "load": 0,
        }
    )

    urgency_breakdown = {
        "Low": len([q for q in queue_entries if q.get("urgency") == "Low"]),
        "Medium": len([q for q in queue_entries if q.get("urgency") == "Medium"]),
        "High": len([q for q in queue_entries if q.get("urgency") == "High"]),
        "Critical": len([q for q in queue_entries if q.get("urgency") == "Critical"]),
    }

    status_breakdown = {
        "waiting": waiting_count,
        "in_consultation": in_consultation_count,
        "completed": completed_count,
        "cancelled": cancelled_count,
    }

    hourly_map = {}

    today_ist = datetime.now(timezone.utc) + timedelta(hours=5, minutes=30)
    today_date_ist = today_ist.date()

    for item in symptom_submissions:
        created_at = item.get("created_at")

        if not created_at:
            continue

        try:
            dt_utc = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
            dt_ist = dt_utc + timedelta(hours=5, minutes=30)

            if dt_ist.date() != today_date_ist:
                continue

            hour_label = dt_ist.strftime("%I %p")
        except Exception:
            hour_label = "Unknown"

        hourly_map[hour_label] = hourly_map.get(hour_label, 0) + 1

    hourly_inflow = [
        {
            "time": key,
            "patients": value,
        }
        for key, value in hourly_map.items()
    ]

    hourly_inflow = sorted(
        hourly_inflow,
        key=lambda item: datetime.strptime(item["time"], "%I %p")
        if item["time"] != "Unknown"
        else datetime.min
    )

    if not hourly_inflow:
        hourly_inflow = [
            {
                "time": "No Data",
                "patients": 0,
            }
        ]

    peak_hour = max(
        hourly_inflow,
        key=lambda item: int(item.get("patients") or 0)
    )

    total_consultation_capacity = sum(
        max(1, round(60 / int(d.get("consultation_minutes") or 15)))
        for d in doctors
        if d.get("is_available") is True
    )

    queue_pressure = min(
        100,
        round((waiting_count / max(active_doctors * 5, 1)) * 100)
    )

    confirmation_rate = (
        round((confirmed_count / total_patients) * 100)
        if total_patients > 0
        else 0
    )

    completion_rate = (
        round((completed_count / total_patients) * 100)
        if total_patients > 0
        else 0
    )

    doctor_availability_rate = (
        round((active_doctors / len(doctors)) * 100)
        if doctors
        else 0
    )

    risk_score = min(
        100,
        high_priority_count * 20 + queue_pressure // 2 + unavailable_doctors * 10
    )

    operational_metrics = [
        {
            "label": "Queue Pressure",
            "value": queue_pressure,
            "suffix": "%",
            "description": "Based on waiting patients versus active doctor capacity.",
        },
        {
            "label": "Confirmation Rate",
            "value": confirmation_rate,
            "suffix": "%",
            "description": "Percentage of queue patients who confirmed appointment.",
        },
        {
            "label": "Completion Rate",
            "value": completion_rate,
            "suffix": "%",
            "description": "Percentage of consultations marked completed.",
        },
        {
            "label": "Doctor Availability",
            "value": doctor_availability_rate,
            "suffix": "%",
            "description": "Percentage of doctors currently available.",
        },
        {
            "label": "Hourly Capacity",
            "value": total_consultation_capacity,
            "suffix": "/hr",
            "description": "Estimated patients that active doctors can handle per hour.",
        },
        {
            "label": "Operational Risk Score",
            "value": risk_score,
            "suffix": "%",
            "description": "Derived from priority load, queue pressure and unavailable doctors.",
        },
    ]

    recent_alerts = []

    if high_priority_count > 0:
        recent_alerts.append({
            "title": "High priority cases detected",
            "description": f"{high_priority_count} high or critical urgency cases are currently recorded.",
            "type": "Emergency Load",
        })

    if average_wait_time >= 30:
        recent_alerts.append({
            "title": "Average wait time is high",
            "description": f"Current average waiting time is {average_wait_time} minutes.",
            "type": "Queue Alert",
        })

    if unavailable_doctors > 0:
        recent_alerts.append({
            "title": "Some doctors unavailable",
            "description": f"{unavailable_doctors} doctor(s) are currently marked unavailable.",
            "type": "Availability",
        })

    if queue_pressure >= 70:
        recent_alerts.append({
            "title": "Queue pressure is increasing",
            "description": f"Current queue pressure is {queue_pressure}%. More doctors may be needed.",
            "type": "Capacity Alert",
        })

    if highest_wait_department.get("average_wait_time", 0) >= 30:
        recent_alerts.append({
            "title": "Department wait time requires attention",
            "description": f"{highest_wait_department['name']} has an average wait time of {highest_wait_department['average_wait_time']} minutes.",
            "type": "Department Alert",
        })

    if not recent_alerts:
        recent_alerts.append({
            "title": "Operations stable",
            "description": "No major operational alerts detected from current queue data.",
            "type": "Normal",
        })

    return {
        "summary": {
            "total_patients": total_patients,
            "average_wait_time": average_wait_time,
            "high_priority_count": high_priority_count,
            "confirmed_count": confirmed_count,
            "waiting_count": waiting_count,
            "in_consultation_count": in_consultation_count,
            "completed_count": completed_count,
            "cancelled_count": cancelled_count,
            "active_doctors": active_doctors,
            "unavailable_doctors": unavailable_doctors,
            "total_walkin_load": total_walkin_load,
            "average_consultation_time": average_consultation_time,
            "highest_load": highest_load,
            "highest_wait_department": highest_wait_department,
            "busiest_doctor": busiest_doctor,
            "peak_hour": peak_hour,
            "queue_pressure": queue_pressure,
            "confirmation_rate": confirmation_rate,
            "completion_rate": completion_rate,
            "doctor_availability_rate": doctor_availability_rate,
            "risk_score": risk_score,
            "total_consultation_capacity": total_consultation_capacity,
        },
        "department_load": department_load,
        "department_wait_times": department_wait_times,
        "doctor_workload": doctor_workload,
        "urgency_breakdown": urgency_breakdown,
        "status_breakdown": status_breakdown,
        "hourly_inflow": hourly_inflow,
        "operational_metrics": operational_metrics,
        "recent_alerts": recent_alerts,
    }


# -------------------------------------------------------------------
# APPOINTMENTS
# -------------------------------------------------------------------

@app.post("/appointments")
def book_appointment(
    payload: AppointmentRequest,
    current_user: dict = Depends(get_current_user),
):
    existing = (
        supabase
        .table("appointments")
        .select("id")
        .eq("doctor_id", payload.doctor_id)
        .eq("appointment_date", payload.appointment_date)
        .eq("appointment_time", payload.appointment_time)
        .execute()
    )

    if existing.data:
        raise HTTPException(status_code=409, detail="This slot is already booked")

    result = (
        supabase
        .table("appointments")
        .insert({
            "user_id": current_user["id"],
            "doctor_id": payload.doctor_id,
            "department_id": payload.department_id,
            "appointment_date": payload.appointment_date,
            "appointment_time": payload.appointment_time,
            "reason": payload.reason,
            "status": "booked",
        })
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=500, detail="Could not book appointment")

    return {
        "message": "Appointment booked successfully",
        "appointment": result.data[0],
    }


@app.get("/appointments/my")
def my_appointments(current_user: dict = Depends(get_current_user)):
    result = (
        supabase
        .table("appointments")
        .select(
            "id, appointment_date, appointment_time, status, reason, "
            "doctors(full_name), departments(name)"
        )
        .eq("user_id", current_user["id"])
        .order("appointment_date", desc=True)
        .execute()
    )

    return result.data or []


@app.get("/admin/appointments")
def admin_appointments(admin: dict = Depends(require_admin)):
    result = (
        supabase
        .table("appointments")
        .select(
            "id, appointment_date, appointment_time, status, reason, "
            "app_users(full_name, email), doctors(full_name), departments(name)"
        )
        .order("appointment_date", desc=True)
        .execute()
    )

    return result.data or []







