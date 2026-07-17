from fastapi import APIRouter, HTTPException
from app.db import supabase

router = APIRouter(prefix="/api/saas", tags=["Multi-Hospital SaaS"])

@router.get("/status/{row_id}")
def get_saas_status(row_id: int):
    """Fetches SaaS configuration directly from the ambulance_status master table"""
    try:
        result = supabase.table("ambulance_status").select("id, multi_saas_status").eq("id", row_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail=f"SaaS node with ID {row_id} not found")
        
        # Format it cleanly for the frontend code we wrote earlier
        return {
            "id": result.data[0]["id"],
            "branch_status": result.data[0]["multi_saas_status"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/status/{row_id}")
def update_saas_status(row_id: int, saas_status: str):
    """Admin updates the multi-tenant allocation field dynamically"""
    try:
        result = supabase.table("ambulance_status").update({"multi_saas_status": saas_status}).eq("id", row_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail=f"Failed to update SaaS cluster with ID {row_id}")
        return {"message": "SaaS cluster routing updated successfully", "data": result.data[0]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))