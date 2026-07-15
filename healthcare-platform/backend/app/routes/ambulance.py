from fastapi import APIRouter, HTTPException
from app.db import supabase

router = APIRouter(prefix="/api/ambulance", tags=["Global Admin Dashboard"])

@router.get("/status/{row_id}")
def get_global_status(row_id: int):
    """Fetches ambulance count, report summarization status, and SaaS status for a specific row"""
    try:
        result = supabase.table("ambulance_status").select("*").eq("id", row_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail=f"Status record with ID {row_id} not found")
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@router.get("/list")
def get_hospital_list():
    """Fetches just the IDs and names of all registered hospitals for dropdown lists"""
    try:
        result = supabase.table("ambulance_status").select("id, hospital_name").order("id").execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@router.put("/status/{row_id}")
def update_global_status(row_id: int, count: int = None, report_status: str = None, saas_status: str = None):
    """Admin updates any or all 3 features in the same row dynamically"""
    update_data = {}
    
    if count is not None:
        if count < 0:
            raise HTTPException(status_code=400, detail="Count cannot be negative")
        update_data["available_count"] = count
    if report_status:
        update_data["report_summary_status"] = report_status
    if saas_status:
        update_data["multi_saas_status"] = saas_status

    if not update_data:
        raise HTTPException(status_code=400, detail="No data provided to update")

    try:
        result = supabase.table("ambulance_status").update(update_data).eq("id", row_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail=f"Failed to update record with ID {row_id}")
        return {"message": "Global features updated successfully", "data": result.data[0]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))