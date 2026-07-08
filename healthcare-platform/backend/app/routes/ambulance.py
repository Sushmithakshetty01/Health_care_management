from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from .auth import get_current_user
from ..db import supabase

router = APIRouter(prefix="/ambulance", tags=["Ambulance"])

class AmbulanceRequest(BaseModel):
    pickup_location: str
    destination: str
    emergency_type: str
    patient_name: str
    contact_number: str
    notes: Optional[str] = None

class AmbulanceAssign(BaseModel):
    ambulance_id: str
    driver_name: str

class AmbulanceUpdate(BaseModel):
    status: str  # "assigned", "on_the_way", "arrived", "completed"

@router.post("/request")
async def request_ambulance(payload: AmbulanceRequest, current_user = Depends(get_current_user)):
    result = supabase.table("ambulance_requests").insert({
        "user_id": current_user["id"],
        "pickup_location": payload.pickup_location,
        "destination": payload.destination,
        "emergency_type": payload.emergency_type,
        "patient_name": payload.patient_name,
        "contact_number": payload.contact_number,
        "notes": payload.notes,
        "status": "requested",
        "requested_at": datetime.utcnow().isoformat()
    }).execute()

    return {"message": "Ambulance requested successfully", "request": result.data[0]}

@router.get("/my-requests")
async def my_requests(current_user = Depends(get_current_user)):
    result = supabase.table("ambulance_requests").select("*").eq("user_id", current_user["id"]).order("requested_at", desc=True).execute()
    return result.data

@router.get("/all", dependencies=[Depends(get_current_user)])
async def all_requests():
    result = supabase.table("ambulance_requests").select("*, app_users(full_name, email)").order("requested_at", desc=True).execute()
    return result.data

@router.patch("/{request_id}/assign")
async def assign_ambulance(request_id: str, payload: AmbulanceAssign, current_user = Depends(get_current_user)):
    # Add admin check if needed
    result = supabase.table("ambulance_requests").update({
        "status": "assigned",
        "ambulance_id": payload.ambulance_id,
        "driver_name": payload.driver_name,
        "assigned_at": datetime.utcnow().isoformat()
    }).eq("id", request_id).execute()
    
    return {"message": "Ambulance assigned", "data": result.data}

@router.patch("/{request_id}/status")
async def update_status(request_id: str, payload: AmbulanceUpdate):
    result = supabase.table("ambulance_requests").update({
        "status": payload.status,
        "updated_at": datetime.utcnow().isoformat()
    }).eq("id", request_id).execute()
    
    return {"message": "Status updated", "data": result.data}