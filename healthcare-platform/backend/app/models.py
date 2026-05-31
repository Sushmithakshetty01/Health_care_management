from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional

class SignupRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=6, max_length=72)
    role: str = "user"

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

class SymptomSubmitRequest(BaseModel):
    symptom_ids: List[str] = Field(min_length=1)
    age: Optional[int] = None
    gender: Optional[str] = None
    notes: Optional[str] = None
