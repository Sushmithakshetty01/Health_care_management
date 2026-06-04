from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from ..db import supabase
from ..auth import get_current_user


router = APIRouter(prefix="/voice-assistant", tags=["Voice AI Assistant"])


class VoiceAssistantRequest(BaseModel):
    query_text: str


def detect_intent(query: str) -> str:
    text = query.lower()

    if "queue" in text or "token" in text or "waiting" in text or "wait" in text:
        return "queue_status"

    if "appointment" in text or "booking" in text or "booked" in text:
        return "appointments"

    if "doctor" in text or "available doctor" in text:
        return "doctors"

    if "department" in text or "specialist" in text:
        return "departments"

    if "medicine" in text or "pharmacy" in text or "tablet" in text:
        return "medicine"

    if "help" in text or "what can you do" in text:
        return "help"

    return "general"


def build_queue_response(user_id: str) -> str:
    result = (
        supabase
        .table("queue_entries")
        .select(
            "queue_number, urgency, estimated_wait_minutes, status, "
            "appointment_confirmed, doctors(full_name), departments(name), created_at"
        )
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )

    if not result.data:
        return (
            "You do not have any active queue record right now. "
            "Please submit symptoms first to generate a queue token."
        )

    queue = result.data[0]

    doctor_name = (
        queue.get("doctors", {}).get("full_name")
        if queue.get("doctors")
        else "Assigned doctor not available"
    )

    department_name = (
        queue.get("departments", {}).get("name")
        if queue.get("departments")
        else "Assigned department not available"
    )

    confirmed_text = (
        "Your appointment is confirmed."
        if queue.get("appointment_confirmed")
        else "Your appointment is not confirmed yet."
    )

    return (
        f"Your latest queue token is Q-{queue.get('queue_number')}. "
        f"Department: {department_name}. "
        f"Doctor: {doctor_name}. "
        f"Urgency level: {queue.get('urgency')}. "
        f"Current status: {queue.get('status')}. "
        f"Estimated waiting time is {queue.get('estimated_wait_minutes')} minutes. "
        f"{confirmed_text}"
    )


def build_appointment_response(user_id: str) -> str:
    result = (
        supabase
        .table("appointments")
        .select(
            "appointment_date, appointment_time, status, reason, "
            "doctors(full_name), departments(name)"
        )
        .eq("user_id", user_id)
        .order("appointment_date", desc=True)
        .limit(3)
        .execute()
    )

    appointments = result.data or []

    if not appointments:
        return "You do not have any booked appointments right now."

    lines = []

    for appointment in appointments:
        doctor_name = (
            appointment.get("doctors", {}).get("full_name")
            if appointment.get("doctors")
            else "Doctor not available"
        )

        department_name = (
            appointment.get("departments", {}).get("name")
            if appointment.get("departments")
            else "Department not available"
        )

        lines.append(
            f"Appointment on {appointment.get('appointment_date')} "
            f"at {appointment.get('appointment_time')} with {doctor_name} "
            f"in {department_name}. Status: {appointment.get('status')}."
        )

    return "Here are your latest appointments. " + " ".join(lines)


def build_doctors_response() -> str:
    result = (
        supabase
        .table("doctors")
        .select(
            "full_name, specialization, consultation_minutes, is_available, departments(name)"
        )
        .eq("is_available", True)
        .order("full_name")
        .limit(5)
        .execute()
    )

    doctors = result.data or []

    if not doctors:
        return "No doctors are currently marked as available."

    lines = []

    for doctor in doctors:
        department_name = (
            doctor.get("departments", {}).get("name")
            if doctor.get("departments")
            else "Department not assigned"
        )

        specialization = doctor.get("specialization") or "General"

        lines.append(
            f"{doctor.get('full_name')} is available in {department_name}, "
            f"specialization {specialization}, average consultation time "
            f"{doctor.get('consultation_minutes')} minutes."
        )

    return "Available doctors are: " + " ".join(lines)


def build_departments_response() -> str:
    result = (
        supabase
        .table("departments")
        .select("name, description")
        .order("name")
        .execute()
    )

    departments = result.data or []

    if not departments:
        return "No departments are available in the system right now."

    names = [dept.get("name") for dept in departments if dept.get("name")]

    return "Available departments are: " + ", ".join(names) + "."


def build_medicine_response() -> str:
    return (
        "Medicine availability is not connected to a pharmacy table yet. "
        "Please contact hospital staff or wait until pharmacy integration is enabled."
    )


def build_help_response() -> str:
    return (
        "You can ask me about your queue status, waiting time, appointments, "
        "available doctors, departments, and hospital services."
    )


def generate_response(intent: str, user_id: str) -> str:
    if intent == "queue_status":
        return build_queue_response(user_id)

    if intent == "appointments":
        return build_appointment_response(user_id)

    if intent == "doctors":
        return build_doctors_response()

    if intent == "departments":
        return build_departments_response()

    if intent == "medicine":
        return build_medicine_response()

    if intent == "help":
        return build_help_response()

    return (
        "I understood your question, but I can currently help mainly with queue status, "
        "appointments, doctors, departments, and hospital service queries."
    )


@router.post("/ask")
def ask_voice_assistant(
    payload: VoiceAssistantRequest,
    current_user: dict = Depends(get_current_user),
):
    query_text = payload.query_text.strip()

    if not query_text:
        raise HTTPException(status_code=400, detail="Query text is required")

    intent = detect_intent(query_text)
    response_text = generate_response(intent, current_user["id"])

    log_result = (
        supabase
        .table("voice_assistant_logs")
        .insert({
            "user_id": current_user["id"],
            "query_text": query_text,
            "response_text": response_text,
            "intent": intent,
            "source": "voice_assistant",
        })
        .execute()
    )

    return {
        "message": "Voice assistant response generated successfully",
        "intent": intent,
        "query_text": query_text,
        "response_text": response_text,
        "log": log_result.data[0] if log_result.data else None,
    }


@router.get("/my-history")
def get_my_voice_history(current_user: dict = Depends(get_current_user)):
    result = (
        supabase
        .table("voice_assistant_logs")
        .select("id, query_text, response_text, intent, created_at")
        .eq("user_id", current_user["id"])
        .order("created_at", desc=True)
        .limit(20)
        .execute()
    )

    return result.data or []


@router.get("/admin/logs")
def get_all_voice_logs(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    result = (
        supabase
        .table("voice_assistant_logs")
        .select(
            "id, query_text, response_text, intent, created_at, "
            "app_users(full_name, email)"
        )
        .order("created_at", desc=True)
        .limit(100)
        .execute()
    )

    return result.data or []


@router.get("/admin/summary")
def get_voice_summary(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    result = (
        supabase
        .table("voice_assistant_logs")
        .select("intent")
        .execute()
    )

    logs = result.data or []

    intent_counts = {}

    for log in logs:
        intent = log.get("intent") or "unknown"
        intent_counts[intent] = intent_counts.get(intent, 0) + 1

    return {
        "total_queries": len(logs),
        "intent_breakdown": intent_counts,
    }