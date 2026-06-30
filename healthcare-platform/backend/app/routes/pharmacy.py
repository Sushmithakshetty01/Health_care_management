from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel


from ..db import supabase

router = APIRouter(
    prefix="/pharmacy",
    tags=["Pharmacy Management"]
)


class MedicineCreate(BaseModel):
    medicine_name: str
    category: str
    stock_quantity: int
    price: float
    expiry_date: str
    manufacturer: str

class PrescriptionItem(BaseModel):
    medicine_id: int
    quantity: int
    dosage: str


class PrescriptionCreate(BaseModel):
    patient_id: int
    doctor_id: int
    items: list[PrescriptionItem]

def create_low_stock_alert(medicine_id: int, medicine_name: str):

    supabase.table("stock_alerts").insert({
        "medicine_id": medicine_id,
        "alert_message": f"{medicine_name} stock is running low"
    }).execute()

@router.post("/medicines")
@router.post("/medicines")
def add_medicine(
    medicine: MedicineCreate
):

    try:

        response = supabase.table("medicines").insert({
            "medicine_name": medicine.medicine_name,
            "category": medicine.category,
            "stock_quantity": medicine.stock_quantity,
            "price": medicine.price,
            "expiry_date": medicine.expiry_date,
            "manufacturer": medicine.manufacturer
        }).execute()

        inserted_medicine = response.data[0]

        if inserted_medicine["stock_quantity"] < 10:

            create_low_stock_alert(
                inserted_medicine["id"],
                inserted_medicine["medicine_name"]
            )

        return {
            "message": "Medicine added successfully",
            "data": response.data
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/medicines")
def get_medicines():

    try:

        response = supabase.table("medicines").select("*").execute()

        return response.data

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@router.put("/medicines/{medicine_id}")
def update_medicine(
    medicine_id: int,
    medicine: MedicineCreate
):

    try:

        response = supabase.table("medicines").update({
            "medicine_name": medicine.medicine_name,
            "category": medicine.category,
            "stock_quantity": medicine.stock_quantity,
            "price": medicine.price,
            "expiry_date": medicine.expiry_date,
            "manufacturer": medicine.manufacturer
        }).eq("id", medicine_id).execute()

        return {
            "message": "Medicine updated successfully",
            "data": response.data
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/medicines/{medicine_id}")
def delete_medicine(medicine_id: int):

    try:

        # Delete prescription items
        supabase.table("prescription_items") \
            .delete() \
            .eq("medicine_id", medicine_id) \
            .execute()

        # Delete stock alerts
        supabase.table("stock_alerts") \
            .delete() \
            .eq("medicine_id", medicine_id) \
            .execute()

        # Delete medicine
        supabase.table("medicines") \
            .delete() \
            .eq("id", medicine_id) \
            .execute()

        return {
            "message": "Medicine deleted successfully"
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
@router.get("/alerts")
def get_alerts():

    try:

        response = supabase.table("stock_alerts").select("*").execute()

        return response.data

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@router.post("/prescriptions")
def create_prescription(
    prescription: PrescriptionCreate
):

    try:

        # STEP 1 — CREATE PRESCRIPTION

        prescription_response = supabase.table("prescriptions").insert({
            "patient_id": prescription.patient_id,
            "doctor_id": prescription.doctor_id,
            "status": "pending"
        }).execute()

        prescription_id = prescription_response.data[0]["id"]

        # STEP 2 — PROCESS EACH MEDICINE

        for item in prescription.items:

            # GET MEDICINE DETAILS

            medicine_response = supabase.table("medicines") \
                .select("*") \
                .eq("id", item.medicine_id) \
                .execute()

            if not medicine_response.data:
                raise HTTPException(
                    status_code=404,
                    detail=f"Medicine ID {item.medicine_id} not found"
                )

            medicine = medicine_response.data[0]

            # CHECK STOCK

            if medicine["stock_quantity"] < item.quantity:
                raise HTTPException(
                    status_code=400,
                    detail=f"Not enough stock for {medicine['medicine_name']}"
                )

            # SAVE PRESCRIPTION ITEM

            supabase.table("prescription_items").insert({
                "prescription_id": prescription_id,
                "medicine_id": item.medicine_id,
                "quantity": item.quantity,
                "dosage": item.dosage
            }).execute()

            # REDUCE STOCK

            new_stock = medicine["stock_quantity"] - item.quantity

            supabase.table("medicines").update({
                "stock_quantity": new_stock
            }).eq("id", item.medicine_id).execute()

            # LOW STOCK CHECK

            if new_stock < 10:

                create_low_stock_alert(
                    medicine["id"],
                    medicine["medicine_name"]
                )

        return {
            "message": "Prescription created successfully",
            "prescription_id": prescription_id
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/prescriptions")
def get_prescriptions():

    try:

        response = supabase.table("prescriptions") \
            .select("*") \
            .execute()

        return response.data

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/prescriptions/{prescription_id}")
def get_prescription_details(prescription_id: int):

    try:

        prescription_response = supabase.table("prescriptions") \
            .select("*") \
            .eq("id", prescription_id) \
            .execute()

        if not prescription_response.data:
            raise HTTPException(
                status_code=404,
                detail="Prescription not found"
            )

        items_response = supabase.table("prescription_items") \
            .select("*") \
            .eq("prescription_id", prescription_id) \
            .execute()

        return {
            "prescription": prescription_response.data[0],
            "items": items_response.data
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.patch("/prescriptions/{prescription_id}")
def update_prescription_status(
    prescription_id: int,
    status: str
):

    try:

        response = supabase.table("prescriptions").update({
            "status": status
        }).eq("id", prescription_id).execute()

        return {
            "message": "Prescription status updated",
            "data": response.data
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
