import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.config import settings
from app.api.auth import router as auth_router
from app.api.emotion import router as emotion_router

# ---------------------------------------------------------
# Logging Configuration
# ---------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------
# App Initialization
# ---------------------------------------------------------
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

from app.services.ml_service import ml_engine
from app.database.session import engine, Base
import app.models.domain # Import domain models so Base knows about them

@app.on_event("startup")
async def startup_event():
    logger.info("Initializing application and warming up ML engine...")
    ml_engine.load_model()
    
    logger.info("Ensuring database tables are created...")
    Base.metadata.create_all(bind=engine)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------
# Global Error Handling
# ---------------------------------------------------------
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled system error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"message": "Internal server error occurred."},
    )

# ---------------------------------------------------------
# Routers (Modular Architecture)
# ---------------------------------------------------------
app.include_router(auth_router, prefix=f"{settings.API_V1_STR}/auth", tags=["Authentication"])
app.include_router(emotion_router, prefix=f"{settings.API_V1_STR}/emotions", tags=["Emotions"])

@app.get("/")
def health_check():
    logger.info("Health check endpoint accessed")
    return {"status": "online", "message": f"{settings.PROJECT_NAME} API is running!"}
