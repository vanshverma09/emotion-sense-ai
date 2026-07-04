from pydantic import BaseModel, EmailStr
from typing import Optional, Dict
from datetime import datetime

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    role: str
    is_active: bool
    
    class Config:
        from_attributes = True

# --- Emotion Prediction Schemas ---

class PredictRequest(BaseModel):
    image_base64: str

class PredictResponse(BaseModel):
    emotion: str
    confidence: float
    inference_time: float
    timestamp: datetime

class HistoryItem(PredictResponse):
    id: int

class StatisticsResponse(BaseModel):
    total_predictions: int
    most_frequent_emotion: str
    emotion_counts: Dict[str, int]
