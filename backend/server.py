from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime
from enum import Enum


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Service Types
class ServiceType(str, Enum):
    PRIVATE_SECURITY = "Sécurité Privée"
    VIDEO_SURVEILLANCE = "Vidéosurveillance"
    ACCESS_CONTROL = "Contrôle d'Accès"
    INTRUSION_DETECTION = "Détection Intrusion"
    SECURITY_AUDIT = "Audit de sécurité"


# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

class ContactInquiry(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    first_name: str
    last_name: str
    email: EmailStr
    phone: str
    service_type: ServiceType
    message: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    status: str = Field(default="new")

class ContactInquiryCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: str
    service_type: ServiceType
    message: str

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

@api_router.post("/contact", response_model=ContactInquiry)
async def create_contact_inquiry(input: ContactInquiryCreate):
    inquiry_dict = input.dict()
    inquiry_obj = ContactInquiry(**inquiry_dict)
    await db.contact_inquiries.insert_one(inquiry_obj.dict())
    return inquiry_obj

@api_router.get("/contact", response_model=List[ContactInquiry])
async def get_contact_inquiries():
    inquiries = await db.contact_inquiries.find().to_list(1000)
    return [ContactInquiry(**inquiry) for inquiry in inquiries]

@api_router.get("/services")
async def get_services():
    return {
        "services": [
            {
                "id": "private_security",
                "name": "Sécurité Privée",
                "description": "Agents de sécurité qualifiés pour la protection de vos locaux, événements et personnes.",
                "features": ["Surveillance 24h/24", "Intervention rapide", "Agents certifiés"]
            },
            {
                "id": "video_surveillance", 
                "name": "Vidéosurveillance",
                "description": "Systèmes de surveillance moderne avec monitoring en temps réel et enregistrement haute définition.",
                "features": ["Caméras HD/4K", "Monitoring à distance", "Stockage sécurisé"]
            },
            {
                "id": "access_control",
                "name": "Contrôle d'Accès", 
                "description": "Solutions complètes de contrôle d'accès pour sécuriser vos entrées et zones sensibles.",
                "features": ["Badges RFID", "Biométrie", "Gestion centralisée"]
            },
            {
                "id": "intrusion_detection",
                "name": "Détection Intrusion",
                "description": "Systèmes d'alarme intelligents avec détection périmétrique et centrale de surveillance.",
                "features": ["Détecteurs intelligents", "Alerte instantanée", "Télésurveillance"]
            }
        ]
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
