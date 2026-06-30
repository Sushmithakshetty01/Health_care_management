from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field, ConfigDict

from ..auth import get_current_user
from ..db import supabase


router = APIRouter(prefix="/digital-token", tags=["Digital Token & QR Queue"])

PRIORITY_LEVELS = {"normal", "senior", "emergency"}
TOKEN_STATUSES = {
    "waiting",
    "called",
    "checked_in",
    "in_consultation",
    "completed",
    "skipped",
    "no_show",
    "cancelled",
}
SOURCES = {"reception", "self", "kiosk", "phone"}


def require_admin(current_user: dict = None):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


def clean_optional(value):
    if value is None:
        return None
    cleaned = str(value).strip()
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
            "invalid",
            "cannot",
            "required",
        ]
    ):
        raise HTTPException(status_code=409, detail=message)

    raise HTTPException(status_code=500, detail="Database operation failed")


# -------------------------------------------------------------------
# SCHEMAS
# -------------------------------------------------------------------

class TokenCreateRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")

    department_id: str
    patient_name: str = Field(min_length=2, max_length=120)
    patient_phone: str | None = Field(default=None, max_length=30)
    patient_age: int | None = Field(default=None, ge=0, le=130)
    patient_gender: str | None = Field(default=None, max_length=20)
    patient_id: str | None = None
    doctor_id: str | None = None
    priority: str = "normal"
    source: str = "reception"
    notes: str | None = Field(default=None, max_length=500)


class TokenStatusUpdateRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")

    status: str
    notes: str | None = Field(default=None, max_length=500)


class TokenNotesRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")

    notes: str | None = Field(default=None, max_length=500)


class CheckInRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")

    qr_token: str = Field(min_length=4, max_length=200)


class DepartmentCreateRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    code: str = Field(min_length=2, max_length=10)
    prefix: str = Field(min_length=2, max_length=10)
    default_consult_minutes: int = Field(default=10, ge=1, le=120)
    is_emergency: bool = False
    is_active: bool = True
    display_order: int = 0
    description: str | None = Field(default=None, max_length=300)


class DepartmentUpdateRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")

    name: str | None = Field(default=None, min_length=2, max_length=120)
    default_consult_minutes: int | None = Field(default=None, ge=1, le=120)
    is_emergency: bool | None = None
    is_active: bool | None = None
    display_order: int | None = None
    description: str | None = Field(default=None, max_length=300)


# -------------------------------------------------------------------
# DEPARTMENT QUEUE MANAGEMENT
# -------------------------------------------------------------------

@router.get("/departments")
def list_departments():
    try:
        result = (
            supabase
            .table("department_queues")
            .select( "id, name, code, prefix, default_consult_minutes, "
        "last_token_number, is_emergency, is_active, created_at")
            
            .order("name")
            .execute()
        )
    except Exception as error:
        print("DEPARTMENTS ERROR:", error)
        raise_database_error(error)
    return result.data or []


@router.post("/departments", status_code=201)
def create_department(payload: DepartmentCreateRequest,
                     admin: dict = Depends(require_admin)):
    try:
        result = (
            supabase
            .table("department_queues")
            .insert({
                "name": payload.name.strip(),
                "code": payload.code.strip().upper(),
                "prefix": payload.prefix.strip().upper(),
                "default_consult_minutes": payload.default_consult_minutes,
                "is_emergency": payload.is_emergency,
                "is_active": payload.is_active,
                "display_order": payload.display_order,
                "description": clean_optional(payload.description),
            })
            .execute()
        )
    except Exception as error:
        raise_database_error(error)
    return {"message": "Department queue created", "department": result.data}


@router.patch("/departments/{department_id}")
def update_department(department_id: str, payload: DepartmentUpdateRequest,
                     admin: dict = Depends(require_admin)):
    update_data = payload.model_dump(exclude_unset=True)
    if "name" in update_data:
        update_data["name"] = clean_optional(update_data["name"])
    if "description" in update_data:
        update_data["description"] = clean_optional(update_data["description"])
    if not update_data:
        raise HTTPException(status_code=400, detail="No update data provided")
    update_data["updated_at"] = datetime.utcnow().isoformat()

    try:
        result = (
            supabase
            .table("department_queues")
            .update(update_data)
            .eq("id", department_id)
            .execute()
        )
    except Exception as error:
        raise_database_error(error)
    if not result.data:
        raise HTTPException(status_code=404, detail="Department not found")
    return {"message": "Department updated", "department": result.data}


# -------------------------------------------------------------------
# TOKEN LISTING & DETAILS
# -------------------------------------------------------------------

@router.get("/tokens")
def list_tokens(
    department_id: str | None = None,
    status: str | None = None,
    priority: str | None = None,
    active_only: bool = False,
    search: str = Query(default="", max_length=120),
    current_user=None,
):
    if status and status not in TOKEN_STATUSES:
        raise HTTPException(status_code=400, detail="Invalid token status")
    if priority and priority not in PRIORITY_LEVELS:
        raise HTTPException(status_code=400, detail="Invalid priority level")

    query = (
        supabase
        .table("queue_tokens")
        .select(
    "id, token_number, department_id, patient_id, patient_name, "
    "priority, status, qr_token, estimated_wait_minutes, "
    "position, issued_at, checked_in_at, completed_at, "
    "created_at, updated_at, "
    "department:department_queues(id, name, code, prefix, is_emergency)"
)
    )
    if department_id:
        query = query.eq("department_id", department_id)
    if status:
        query = query.eq("status", status)
    if priority:
        query = query.eq("priority", priority)
    if active_only:
        query = query.in_("status", [
            "waiting", "called", "checked_in", "in_consultation"
        ])
    if search.strip():
        query = query.ilike("token_number", f"%{search.strip()}%")

    result = query.order("issued_at", desc=True).limit(200).execute()
    return result.data or []


@router.get("/tokens/mine")
def my_tokens(current_user=None):
    result = (
        supabase
        .table("queue_tokens")
       .select(
    "id, token_number, status, priority, position, "
    "estimated_wait_minutes, issued_at, checked_in_at, "
    "completed_at, qr_token, "
    "department:department_queues(id, name, code, prefix, is_emergency)"
)
        .order("issued_at", desc=True)
        .limit(50)
        .execute()
    )
    return result.data or []


@router.get("/tokens/{token_id}")
def get_token(token_id: str, current_user=None):
    result = (
        supabase
        .table("queue_tokens")
        .select(
    "id, token_number, department_id, patient_id, patient_name, "
    "priority, status, qr_token, estimated_wait_minutes, "
    "position, issued_at, checked_in_at, completed_at, "
    "created_at, updated_at, "
    "department:department_queues(id, name, code, prefix, is_emergency)"
)
        .eq("id", token_id)
        .limit(1)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Token not found")
    return result.data[0]


@router.get("/tokens/lookup/{qr_token}")
def lookup_token(qr_token: str, current_user=None):
    result = (
        supabase
        .table("queue_tokens")
        .select(
            "id, token_number, status, priority, position, "
            "estimated_wait_minutes, patient_name, issued_at, checked_in_at, "
            "called_at, completed_at, qr_token, "
            "department:department_queues(id, name, code, prefix, is_emergency)"
        )
        .eq("qr_token", qr_token)
        .limit(1)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Token not found")
    return result.data[0]


# -------------------------------------------------------------------
# TOKEN ISSUANCE
# -------------------------------------------------------------------

@router.post("/tokens", status_code=201)
def issue_token(payload: TokenCreateRequest, current_user=None):
    if payload.priority not in PRIORITY_LEVELS:
        raise HTTPException(status_code=400, detail="Invalid priority level")
    if payload.source not in SOURCES:
        raise HTTPException(status_code=400, detail="Invalid source")

    created_by =  None
    patient_id = payload.patient_id

    # self-service flow: bind token to the logged in patient if not provided
    if not patient_id :
        patient_id = None

    try:
        result = (
    supabase
    .rpc(
        "issue_queue_token",
        {
            "p_department_id": payload.department_id,
            "p_patient_name": payload.patient_name,
            "p_patient_id": patient_id,
            "p_priority": payload.priority
        }
    )
    .execute()
)
    except Exception as error:
        raise_database_error(error)

    return {"message": "Token issued", "token": result.data}


# -------------------------------------------------------------------
# TOKEN STATUS TRANSITIONS
# -------------------------------------------------------------------

@router.post("/tokens/{token_id}/status")
def update_token_status(
    token_id: str,
    payload: TokenStatusUpdateRequest,
    current_user=None,
):
    if payload.status not in TOKEN_STATUSES:
        raise HTTPException(status_code=400, detail="Invalid token status")

    role = "user"
    actor_id = None

    if current_user:
        role = current_user.get("role", "user")
        actor_id = current_user.get("id")

    try:
        result = (
            supabase
            .rpc(
                "update_token_status",
                {
                    "p_token_id": token_id,
                    "p_new_status": payload.status,
                    "p_actor_id": actor_id,
                    "p_actor_role": "admin" if role == "admin" else "patient",
                    "p_notes": clean_optional(payload.notes),
                },
            )
            .execute()
        )
    except Exception as error:
        raise_database_error(error)

    return {
        "message": "Token status updated",
        "token": result.data,
    }


@router.post("/tokens/{token_id}/notes")
def update_token_notes(
    token_id: str,
    payload: TokenNotesRequest,
    current_user=None,
):
    try:
        result = (
            supabase
            .table("queue_tokens")
            .update({
                "notes": clean_optional(payload.notes),
                "updated_at": datetime.utcnow().isoformat(),
            })
            .eq("id", token_id)
            .execute()
        )
    except Exception as error:
        raise_database_error(error)
    if not result.data:
        raise HTTPException(status_code=404, detail="Token not found")
    return {"message": "Notes updated", "token": result.data}


# -------------------------------------------------------------------
# CHECK-IN
# -------------------------------------------------------------------

@router.post("/checkin")
def check_in(payload: CheckInRequest, current_user=None):
    try:
        result = (
            supabase
            .rpc("check_in_queue_token", {"p_qr_token": payload.qr_token.strip()})
            .execute()
        )
    except Exception as error:
        raise_database_error(error)
    return {"message": "Patient checked in", "token": result.data}


# -------------------------------------------------------------------
# CALL NEXT (ADMIN)
# -------------------------------------------------------------------

@router.post("/departments/{department_id}/call-next")
def call_next(department_id: str):
    try:
        result = (
            supabase
            .rpc("call_next_queue_token", {
                "p_department_id": department_id,
                "p_actor_id": None,
            })
            .execute()
        )
    except Exception as error:
        raise_database_error(error)
    return {"message": "Next token called", "token": result.data}


# -------------------------------------------------------------------
# ANALYTICS
# -------------------------------------------------------------------

@router.get("/analytics")
def get_analytics(
    start_date: str | None = None,
    end_date: str | None = None,
    current_user=None,
):
    today = datetime.now(timezone.utc).date()
    start = start_date or today.isoformat()
    end = end_date or today.isoformat()

    try:
        result = (
            supabase
            .rpc("queue_analytics", {
                "p_start_date": start,
                "p_end_date": end,
            })
            .execute()
        )
        print("ANALYTICS RESULT:", result.data)
    except Exception as error:
        print("ANALYTICS ERROR:", error)
        raise_database_error(error)

    payload = result.data or {}

    # augment with live counters for currently waiting patients
    try:
        active = (
    supabase
    .table("queue_tokens")
    .select(
        "id, status, priority, department_id, "
        "department:department_queues(id, name, code, prefix)"
    )
    .in_("status", [
        "waiting",
        "called",
        "checked_in",
        "in_consultation",
        "completed"
    ])
    .execute()
)
    except Exception as error:
        raise_database_error(error)

    active_data = active.data or []
    active_by_department = {}
    for token in active_data:
        dept = token.get("department") or {}
        key = dept.get("id") or token.get("department_id") or "unknown"
        bucket = active_by_department.setdefault(key, {
            "department_id": key,
            "name": dept.get("name", "Unknown"),
            "code": dept.get("code", ""),
            "prefix": dept.get("prefix", ""),
            "active_count": 0,
            "emergency_count": 0,
            "senior_count": 0,
        })
        bucket["active_count"] += 1
        if token.get("priority") == "emergency":
            bucket["emergency_count"] += 1
        elif token.get("priority") == "senior":
            bucket["senior_count"] += 1

    payload["active_totals"] = {
    "waiting": sum(1 for t in active_data if t["status"] == "waiting"),
    "checked_in": sum(1 for t in active_data if t["status"] == "checked_in"),
    "called": sum(1 for t in active_data if t["status"] == "called"),
    "completed": sum(1 for t in active_data if t["status"] == "completed"),
}
    
    payload["active_by_department"] = list(active_by_department.values())
    return payload


# -------------------------------------------------------------------
# ACTIVITY LOG
# -------------------------------------------------------------------

@router.get("/tokens/{token_id}/activity")
def token_activity(token_id: str, current_user=None):
    result = (
        supabase
        .table("queue_activity_logs")
        .select(
            "id, token_id, action, from_status, to_status, notes, created_at"
        )
        .eq("token_id", token_id)
        .order("created_at", desc=True)
        .limit(100)
        .execute()
    )
    return result.data or []

# -------------------------------------------------------------------
# RECENT NOTIFICATIONS
# -------------------------------------------------------------------

@router.get("/notifications")
def my_notifications(current_user=None):
    result = (
        supabase
        .table("queue_notifications")
        .select("id, title, message, is_read, created_at, token_id")
        .order("created_at", desc=True)
        .limit(30)
        .execute()
    )
    return result.data or []
