from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from ..db import supabase
from ..auth import get_current_user


router = APIRouter(prefix="/feedback", tags=["Patient Feedback"])


class PatientFeedbackCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    waiting_experience: str
    doctor_feedback: str | None = None
    comments: str | None = None
    satisfaction_score: int | None = Field(default=None, ge=1, le=10)


@router.post("")
def create_feedback(
    payload: PatientFeedbackCreate,
    current_user: dict = Depends(get_current_user),
):
    result = (
        supabase
        .table("patient_feedback")
        .insert({
            "user_id": current_user["id"],
            "rating": payload.rating,
            "waiting_experience": payload.waiting_experience,
            "doctor_feedback": payload.doctor_feedback,
            "comments": payload.comments,
            "satisfaction_score": payload.satisfaction_score,
        })
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=500, detail="Could not submit feedback")

    return {
        "message": "Feedback submitted successfully",
        "feedback": result.data[0],
    }


@router.get("/my")
def get_my_feedback(current_user: dict = Depends(get_current_user)):
    result = (
        supabase
        .table("patient_feedback")
        .select(
            "id, rating, waiting_experience, doctor_feedback, comments, "
            "satisfaction_score, created_at"
        )
        .eq("user_id", current_user["id"])
        .order("created_at", desc=True)
        .execute()
    )

    return result.data or []


@router.get("/admin")
def get_all_feedback(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    result = (
        supabase
        .table("patient_feedback")
        .select(
            "id, rating, waiting_experience, doctor_feedback, comments, "
            "satisfaction_score, created_at, app_users(full_name, email)"
        )
        .order("created_at", desc=True)
        .execute()
    )

    return result.data or []


@router.get("/admin/summary")
def get_feedback_summary(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    result = (
        supabase
        .table("patient_feedback")
        .select("rating, satisfaction_score")
        .execute()
    )

    feedbacks = result.data or []

    total_feedback = len(feedbacks)

    if total_feedback == 0:
        return {
            "total_feedback": 0,
            "average_rating": 0,
            "average_satisfaction_score": 0,
        }

    ratings = [int(item["rating"]) for item in feedbacks if item.get("rating") is not None]

    satisfaction_scores = [
        int(item["satisfaction_score"])
        for item in feedbacks
        if item.get("satisfaction_score") is not None
    ]

    average_rating = round(sum(ratings) / len(ratings), 2) if ratings else 0

    average_satisfaction_score = (
        round(sum(satisfaction_scores) / len(satisfaction_scores), 2)
        if satisfaction_scores
        else 0
    )

    return {
        "total_feedback": total_feedback,
        "average_rating": average_rating,
        "average_satisfaction_score": average_satisfaction_score,
    }