import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to Emotion Sense AI API"}

def test_login_invalid_credentials():
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "wronguser", "password": "wrongpassword"}
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect username or password"

def test_predict_endpoint_unauthorized():
    # Attempting to access protected endpoint without token
    response = client.post("/api/v1/emotions/predict")
    assert response.status_code == 401
