from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from ..db import supabase
from ..auth import get_current_user


router = APIRouter(prefix="/disease-risk", tags=["Disease Risk Prediction"])


class DiseaseRiskRequest(BaseModel):
    symptom_ids: list[str] = Field(..., min_length=1)
    age: int = Field(..., ge=1, le=120)
    gender: str | None = None
    notes: str | None = None


def calculate_age_score(age: int) -> int:
    if age >= 65:
        return 4
    if age >= 45:
        return 2
    if age <= 5:
        return 3
    return 0


def calculate_notes_score(notes: str | None) -> int:
    if not notes:
        return 0

    text = notes.lower()

    high_risk_words = [
        "chest pain",
        "breathing difficulty",
        "shortness of breath",
        "unconscious",
        "severe pain",
        "blood",
        "fainting",
        "stroke",
        "heart",
        "emergency",
    ]

    score = 0

    for word in high_risk_words:
        if word in text:
            score += 3

    return min(score, 9)


def get_risk_level(score: int) -> str:
    if score >= 18:
        return "Critical"
    if score >= 12:
        return "High"
    if score >= 7:
        return "Medium"
    return "Low"


def get_recommendation(risk_level: str, department: str) -> str:
    if risk_level == "Critical":
        return (
            f"High priority attention is recommended. Please contact hospital staff "
            f"or emergency support immediately. Suggested department: {department}. "
            f"This is only a risk indication, not a final diagnosis."
        )

    if risk_level == "High":
        return (
            f"Medical consultation is recommended as soon as possible. "
            f"Suggested department: {department}. "
            f"This is only a risk indication, not a final diagnosis."
        )

    if risk_level == "Medium":
        return (
            f"Please monitor the symptoms and consult the suggested department if symptoms continue. "
            f"Suggested department: {department}. "
            f"This is only a risk indication, not a final diagnosis."
        )

    return (
        f"Current risk indication is low. Continue monitoring symptoms. "
        f"Suggested department: {department}. "
        f"This is only a risk indication, not a final diagnosis."
    )


@router.post("/predict")
def predict_disease_risk(
    payload: DiseaseRiskRequest,
    current_user: dict = Depends(get_current_user),
):
    symptoms_result = (
        supabase
        .table("symptoms")
        .select("id, name, department, severity_weight")
        .in_("id", payload.symptom_ids)
        .execute()
    )

    selected_symptoms = symptoms_result.data or []

    if not selected_symptoms:
        raise HTTPException(status_code=400, detail="No valid symptoms selected")

    symptom_score = sum(
        int(symptom.get("severity_weight") or 1)
        for symptom in selected_symptoms
    )

    age_score = calculate_age_score(payload.age)
    notes_score = calculate_notes_score(payload.notes)

    total_score = symptom_score + age_score + notes_score
    risk_level = get_risk_level(total_score)

    highest_symptom = max(
        selected_symptoms,
        key=lambda symptom: int(symptom.get("severity_weight") or 1),
    )

    suggested_department = highest_symptom.get("department") or "General Medicine"

    symptom_names = [
        symptom.get("name")
        for symptom in selected_symptoms
        if symptom.get("name")
    ]

    explanation = (
        f"Risk score is calculated from selected symptoms, age and notes. "
        f"Selected symptoms: {', '.join(symptom_names)}. "
        f"Symptom score: {symptom_score}. "
        f"Age score: {age_score}. "
        f"Notes score: {notes_score}. "
        f"Final risk score: {total_score}. "
        f"Risk level: {risk_level}. "
        f"Suggested department: {suggested_department}."
    )

    recommendation = get_recommendation(risk_level, suggested_department)

    insert_result = (
        supabase
        .table("disease_risk_predictions")
        .insert({
            "user_id": current_user["id"],
            "symptom_ids": payload.symptom_ids,
            "selected_symptoms": selected_symptoms,
            "age": payload.age,
            "gender": payload.gender,
            "notes": payload.notes,
            "risk_score": total_score,
            "risk_level": risk_level,
            "suggested_department": suggested_department,
            "explanation": explanation,
            "recommendation": recommendation,
        })
        .execute()
    )

    if not insert_result.data:
        raise HTTPException(status_code=500, detail="Could not save risk prediction")

    return {
        "message": "Disease risk prediction generated successfully",
        "prediction": insert_result.data[0],
        "risk_score": total_score,
        "risk_level": risk_level,
        "suggested_department": suggested_department,
        "explanation": explanation,
        "recommendation": recommendation,
        "selected_symptoms": selected_symptoms,
    }


@router.get("/my-history")
def get_my_risk_history(current_user: dict = Depends(get_current_user)):
    result = (
        supabase
        .table("disease_risk_predictions")
        .select(
            "id, selected_symptoms, age, gender, notes, risk_score, risk_level, "
            "suggested_department, explanation, recommendation, created_at"
        )
        .eq("user_id", current_user["id"])
        .order("created_at", desc=True)
        .limit(20)
        .execute()
    )

    return result.data or []


@router.get("/admin/predictions")
def get_all_risk_predictions(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    result = (
        supabase
        .table("disease_risk_predictions")
        .select(
            "id, selected_symptoms, age, gender, risk_score, risk_level, "
            "suggested_department, explanation, recommendation, created_at, "
            "app_users(full_name, email)"
        )
        .order("created_at", desc=True)
        .limit(100)
        .execute()
    )

    return result.data or []


@router.get("/admin/summary")
def get_risk_summary(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    result = (
        supabase
        .table("disease_risk_predictions")
        .select("risk_level, risk_score, suggested_department")
        .execute()
    )

    predictions = result.data or []

    level_counts = {}
    department_counts = {}

    for item in predictions:
        level = item.get("risk_level") or "Unknown"
        department = item.get("suggested_department") or "Unknown"

        level_counts[level] = level_counts.get(level, 0) + 1
        department_counts[department] = department_counts.get(department, 0) + 1

    scores = [
        int(item.get("risk_score") or 0)
        for item in predictions
    ]

    average_score = round(sum(scores) / len(scores), 2) if scores else 0

    return {
        "total_predictions": len(predictions),
        "average_risk_score": average_score,
        "risk_level_breakdown": level_counts,
        "department_breakdown": department_counts,
    }