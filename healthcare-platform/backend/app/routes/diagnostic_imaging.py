from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.db import supabase

router = APIRouter(prefix="/diagnostic", tags=["Diagnostic Imaging Queue"])

class QueueItem(BaseModel):
    patient_name: str
    imaging_type: str
    priority: bool = False

class UpdateItem(BaseModel):
    id: int
    imaging_type: str

@router.get("/queue")
def get_imaging_queue():
    response = supabase.table("diagnostic_queue").select("*").execute()
    return response.data

@router.post("/join")
def join_queue(item: QueueItem):
    data = {
        "patient_name": item.patient_name,
        "imaging_type": item.imaging_type,
        "priority": item.priority
    }
    response = supabase.table("diagnostic_queue").insert(data).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Failed to join the queue")
    return {"status": "success", "data": response.data}

@router.post("/update")
def update_queue_item(item: UpdateItem):
    response = supabase.table("diagnostic_queue").update({"imaging_type": item.imaging_type}).eq("id", item.id).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Failed to update patient modality")
    return {"status": "success", "data": response.data}

@router.delete("/complete/{patient_id}")
def complete_patient(patient_id: int):
    response = supabase.table("diagnostic_queue").delete().eq("id", patient_id).execute()
    return {"status": "success", "message": "Patient cleared"}