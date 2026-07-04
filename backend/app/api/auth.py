from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from jose import jwt, JWTError

from app.models.schemas import Token, UserCreate, UserResponse
from app.utils.security import create_access_token, create_refresh_token, verify_password, get_password_hash
from app.api.deps import get_current_user, get_db, get_current_active_admin
from app.models.domain import User
from app.config import settings

router = APIRouter()

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    """Registers a new user and saves them to PostgreSQL."""
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    hashed_password = get_password_hash(user_in.password)
    
    # Create the DB object
    db_user = User(
        email=user_in.email,
        full_name=user_in.full_name,
        hashed_password=hashed_password,
        role="user" # Default role is user. Can be upgraded manually in DB.
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Authenticates user against PostgreSQL and returns Access & Refresh JWTs."""
    user = db.query(User).filter(User.email == form_data.username).first()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    
    # Generate tokens
    access_token = create_access_token(subject=user.id, role=user.role)
    refresh_token = create_refresh_token(subject=user.id, role=user.role)
    
    return {
        "access_token": access_token, 
        "refresh_token": refresh_token, 
        "token_type": "bearer"
    }

@router.post("/refresh", response_model=Token)
def refresh_token(refresh_token: str):
    """Exchanges a valid refresh token for a fresh access token."""
    try:
        payload = jwt.decode(refresh_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=400, detail="Invalid token type provided.")
        
        user_id = payload.get("sub")
        role = payload.get("role", "user")
        
        # Issue new tokens
        access_token = create_access_token(subject=user_id, role=role)
        new_refresh_token = create_refresh_token(subject=user_id, role=role)
        
        return {
            "access_token": access_token, 
            "refresh_token": new_refresh_token, 
            "token_type": "bearer"
        }
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

@router.get("/me", response_model=UserResponse)
def get_user_profile(current_user: User = Depends(get_current_user)):
    """Returns the currently logged-in user profile, fetched directly from PostgreSQL."""
    return current_user

@router.get("/admin/dashboard", response_model=UserResponse)
def admin_only_route(current_user: User = Depends(get_current_active_admin)):
    """
    Role-Based Access Control (RBAC) test route. 
    Only accessible by users with role='admin'.
    """
    return current_user
