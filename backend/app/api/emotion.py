from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, WebSocket, WebSocketDisconnect
from typing import List
from datetime import datetime
import base64

from app.api.deps import get_current_user
from app.models.schemas import PredictResponse, HistoryItem, StatisticsResponse
from app.services.ml_service import ml_engine

router = APIRouter()

# Mock Database for prediction history: { user_id: [HistoryItem, ...] }
fake_history_db = {}

@router.post("/predict", response_model=PredictResponse)
async def predict_emotion(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    """
    Receives an uploaded image, detects a face via OpenCV, runs the TensorFlow model, and returns the emotion.
    """
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File provided is not an image.")
        
    try:
        image_bytes = await file.read()
        emotion, confidence, inference_time = ml_engine.predict_emotion(image_bytes)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference failed: {str(e)}")
    
    response = PredictResponse(
        emotion=emotion,
        confidence=confidence,
        inference_time=inference_time,
        timestamp=datetime.utcnow()
    )
    
    # Save to history
    user_id = current_user["id"]
    if user_id not in fake_history_db:
        fake_history_db[user_id] = []
        
    history_item = HistoryItem(
        id=len(fake_history_db[user_id]) + 1,
        **response.model_dump()
    )
    fake_history_db[user_id].append(history_item)
    
    return response

@router.websocket("/ws/predict")
async def websocket_predict(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            text_data = await websocket.receive_text()
            if "," in text_data:
                base64_data = text_data.split(",")[1]
            else:
                base64_data = text_data
                
            image_bytes = base64.b64decode(base64_data)
            emotion, confidence, inference_time = ml_engine.predict_emotion(image_bytes)
            
            await websocket.send_json({
                "emotion": emotion,
                "confidence": confidence,
                "inference_time": inference_time,
                "timestamp": datetime.utcnow().isoformat()
            })
    except WebSocketDisconnect:
        pass
    except Exception as e:
        print(f"WebSocket error: {e}")

@router.get("/history", response_model=List[HistoryItem])
def get_prediction_history(current_user: dict = Depends(get_current_user)):
    """Returns all past emotion predictions for the authenticated user."""
    user_id = current_user["id"]
    return fake_history_db.get(user_id, [])

@router.get("/statistics", response_model=StatisticsResponse)
def get_statistics(current_user: dict = Depends(get_current_user)):
    """Returns aggregated statistics of the user's emotions."""
    user_id = current_user["id"]
    history = fake_history_db.get(user_id, [])
    
    if not history:
        return StatisticsResponse(
            total_predictions=0,
            most_frequent_emotion="none",
            emotion_counts={}
        )
        
    counts = {}
    for item in history:
        counts[item.emotion] = counts.get(item.emotion, 0) + 1
        
    most_freq = max(counts, key=counts.get)
    
    return StatisticsResponse(
        total_predictions=len(history),
        most_frequent_emotion=most_freq,
        emotion_counts=counts
    )

@router.delete("/history")
def clear_history(current_user: dict = Depends(get_current_user)):
    """Deletes all prediction history for the authenticated user."""
    user_id = current_user["id"]
    if user_id in fake_history_db:
        fake_history_db[user_id] = []
    return {"message": "History cleared successfully"}
