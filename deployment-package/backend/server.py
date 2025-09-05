from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime
from enum import Enum
from passlib.context import CryptContext
from jose import JWTError, jwt
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import HTTPException, Depends, status
import secrets


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


# Security
SECRET_KEY = os.environ.get('SECRET_KEY', secrets.token_urlsafe(32))
ALGORITHM = "HS256"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Define Enums
class ServiceType(str, Enum):
    PRIVATE_SECURITY = "Sécurité Privée"
    VIDEO_SURVEILLANCE = "Vidéosurveillance"
    ACCESS_CONTROL = "Contrôle d'Accès"
    INTRUSION_DETECTION = "Détection Intrusion"
    SECURITY_AUDIT = "Audit de sécurité"

class UserRole(str, Enum):
    ADMIN = "admin"
    COMMERCIAL = "commercial"
    TECHNICIEN = "technicien"

class DevisStatus(str, Enum):
    BROUILLON = "brouillon"
    ENVOYE = "envoyé"
    ACCEPTE = "accepté"
    REFUSE = "refusé"
    EXPIRE = "expiré"

class ChantierStatus(str, Enum):
    PLANIFIE = "planifié"
    EN_COURS = "en_cours"
    TERMINE = "terminé"
    ANNULE = "annulé"

class InterventionStatus(str, Enum):
    PROGRAMMEE = "programmée"
    EN_COURS = "en_cours"
    TERMINEE = "terminée"
    REPORTEE = "reportée"


# Authentication Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    first_name: str
    last_name: str
    role: UserRole
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    role: UserRole

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

# Client Models
class Client(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    nom: str
    prenom: str
    entreprise: Optional[str] = None
    email: EmailStr
    telephone: str
    adresse: str
    ville: str
    code_postal: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    commercial_id: str

class ClientCreate(BaseModel):
    nom: str
    prenom: str
    entreprise: Optional[str] = None
    email: EmailStr
    telephone: str
    adresse: str
    ville: str
    code_postal: str

# Devis Models
class DevisItem(BaseModel):
    description: str
    quantite: int
    prix_unitaire: float
    total: float

class Devis(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    numero: str
    client_id: str
    commercial_id: str
    titre: str
    description: str
    items: List[DevisItem]
    total_ht: float
    tva: float = 20.0
    total_ttc: float
    status: DevisStatus = DevisStatus.BROUILLON
    date_creation: datetime = Field(default_factory=datetime.utcnow)
    date_validite: datetime
    notes: Optional[str] = None

class DevisCreate(BaseModel):
    client_id: str
    titre: str
    description: str
    items: List[DevisItem]
    date_validite: datetime
    notes: Optional[str] = None

# Bon de Commande Models
class BonCommande(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    numero: str
    devis_id: str
    client_id: str
    commercial_id: str
    date_commande: datetime = Field(default_factory=datetime.utcnow)
    date_livraison_prevue: datetime
    status: str = "confirmé"
    notes: Optional[str] = None

class BonCommandeCreate(BaseModel):
    devis_id: str
    date_livraison_prevue: datetime
    notes: Optional[str] = None

# Chantier Models
class Chantier(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    numero: str
    bon_commande_id: str
    client_id: str
    commercial_id: str
    technicien_ids: List[str] = []
    titre: str
    description: str
    adresse_chantier: str
    date_debut_prevue: datetime
    date_fin_prevue: datetime
    date_debut_reelle: Optional[datetime] = None
    date_fin_reelle: Optional[datetime] = None
    status: ChantierStatus = ChantierStatus.PLANIFIE
    progression: int = 0  # pourcentage
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ChantierCreate(BaseModel):
    bon_commande_id: str
    technicien_ids: List[str] = []
    titre: str
    description: str
    adresse_chantier: str
    date_debut_prevue: datetime
    date_fin_prevue: datetime

class ChantierUpdate(BaseModel):
    status: Optional[ChantierStatus] = None
    progression: Optional[int] = None
    notes: Optional[str] = None
    date_debut_reelle: Optional[datetime] = None
    date_fin_reelle: Optional[datetime] = None

# Intervention Models
class Intervention(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    chantier_id: str
    technicien_id: str
    titre: str
    description: str
    date_intervention: datetime
    duree_prevue: int  # en minutes
    duree_reelle: Optional[int] = None
    status: InterventionStatus = InterventionStatus.PROGRAMMEE
    notes: Optional[str] = None
    photos: List[str] = []  # URLs des photos
    created_at: datetime = Field(default_factory=datetime.utcnow)

class InterventionCreate(BaseModel):
    chantier_id: str
    titre: str
    description: str
    date_intervention: datetime
    duree_prevue: int

class InterventionUpdate(BaseModel):
    status: Optional[InterventionStatus] = None
    duree_reelle: Optional[int] = None
    notes: Optional[str] = None
    photos: Optional[List[str]] = None

# Legacy Models (keep for compatibility)
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

# Authentication Functions
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    to_encode = data.copy()
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        
        user = await db.users.find_one({"id": user_id})
        if user is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
        
        return User(**user)
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

def require_role(allowed_roles: List[UserRole]):
    def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
        return current_user
    return role_checker

# Helper Functions
async def generate_numero(collection_name: str, prefix: str) -> str:
    """Generate a unique number for documents"""
    count = await db[collection_name].count_documents({})
    return f"{prefix}{count + 1:06d}"

# Authentication Routes
@api_router.post("/auth/register", response_model=User)
async def register_user(user_data: UserCreate, current_user: User = Depends(require_role([UserRole.ADMIN]))):
    """Register a new user (Admin only)"""
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    hashed_password = hash_password(user_data.password)
    user_dict = user_data.dict()
    del user_dict["password"]
    
    user = User(**user_dict)
    user_doc = user.dict()
    user_doc["hashed_password"] = hashed_password
    
    await db.users.insert_one(user_doc)
    return user

@api_router.post("/auth/login", response_model=Token)
async def login(user_credentials: UserLogin):
    """Login user"""
    user = await db.users.find_one({"email": user_credentials.email})
    if not user or not verify_password(user_credentials.password, user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    if not user["is_active"]:
        raise HTTPException(status_code=400, detail="Account disabled")
    
    # Update last login
    await db.users.update_one(
        {"id": user["id"]}, 
        {"$set": {"last_login": datetime.utcnow()}}
    )
    
    access_token = create_access_token({"sub": user["id"]})
    user_obj = User(**user)
    
    return Token(access_token=access_token, token_type="bearer", user=user_obj)

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current user info"""
    return current_user

# Client Routes
@api_router.post("/clients", response_model=Client)
async def create_client(client_data: ClientCreate, current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.COMMERCIAL]))):
    """Create a new client"""
    client_dict = client_data.dict()
    client_dict["commercial_id"] = current_user.id
    client = Client(**client_dict)
    
    await db.clients.insert_one(client.dict())
    return client

@api_router.get("/clients", response_model=List[Client])
async def get_clients(current_user: User = Depends(get_current_user)):
    """Get clients (filtered by role)"""
    if current_user.role == UserRole.ADMIN:
        clients = await db.clients.find().to_list(1000)
    else:
        clients = await db.clients.find({"commercial_id": current_user.id}).to_list(1000)
    
    return [Client(**client) for client in clients]

@api_router.get("/clients/{client_id}", response_model=Client)
async def get_client(client_id: str, current_user: User = Depends(get_current_user)):
    """Get a specific client"""
    client = await db.clients.find_one({"id": client_id})
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    # Check permissions
    if current_user.role != UserRole.ADMIN and client["commercial_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return Client(**client)

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Secura Protect ERP API"}

# Devis Routes
@api_router.post("/devis", response_model=Devis)
async def create_devis(devis_data: DevisCreate, current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.COMMERCIAL]))):
    """Create a new devis"""
    # Calculate totals
    total_ht = sum(item.total for item in devis_data.items)
    total_ttc = total_ht * (1 + 20/100)  # 20% TVA
    
    devis_dict = devis_data.dict()
    devis_dict.update({
        "numero": await generate_numero("devis", "DEV"),
        "commercial_id": current_user.id,
        "total_ht": total_ht,
        "total_ttc": total_ttc
    })
    
    devis = Devis(**devis_dict)
    await db.devis.insert_one(devis.dict())
    return devis

@api_router.get("/devis", response_model=List[Devis])
async def get_devis(current_user: User = Depends(get_current_user)):
    """Get devis (filtered by role)"""
    if current_user.role == UserRole.ADMIN:
        devis_list = await db.devis.find().to_list(1000)
    else:
        devis_list = await db.devis.find({"commercial_id": current_user.id}).to_list(1000)
    
    return [Devis(**devis) for devis in devis_list]

@api_router.get("/devis/{devis_id}", response_model=Devis)
async def get_devis_by_id(devis_id: str, current_user: User = Depends(get_current_user)):
    """Get a specific devis"""
    devis = await db.devis.find_one({"id": devis_id})
    if not devis:
        raise HTTPException(status_code=404, detail="Devis not found")
    
    # Check permissions
    if current_user.role != UserRole.ADMIN and devis["commercial_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return Devis(**devis)

@api_router.put("/devis/{devis_id}/status")
async def update_devis_status(devis_id: str, status: DevisStatus, current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.COMMERCIAL]))):
    """Update devis status"""
    result = await db.devis.update_one(
        {"id": devis_id, "commercial_id": current_user.id if current_user.role != UserRole.ADMIN else devis_id},
        {"$set": {"status": status}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Devis not found")
    
    return {"message": "Status updated successfully"}

# Bon de Commande Routes
@api_router.post("/bons-commande", response_model=BonCommande)
async def create_bon_commande(bon_data: BonCommandeCreate, current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.COMMERCIAL]))):
    """Create a bon de commande from a devis"""
    # Get the devis
    devis = await db.devis.find_one({"id": bon_data.devis_id})
    if not devis:
        raise HTTPException(status_code=404, detail="Devis not found")
    
    if devis["status"] != DevisStatus.ACCEPTE:
        raise HTTPException(status_code=400, detail="Devis must be accepted to create bon de commande")
    
    bon_dict = bon_data.dict()
    bon_dict.update({
        "numero": await generate_numero("bons_commande", "BC"),
        "client_id": devis["client_id"],
        "commercial_id": devis["commercial_id"]
    })
    
    bon_commande = BonCommande(**bon_dict)
    await db.bons_commande.insert_one(bon_commande.dict())
    return bon_commande

@api_router.get("/bons-commande", response_model=List[BonCommande])
async def get_bons_commande(current_user: User = Depends(get_current_user)):
    """Get bons de commande (filtered by role)"""
    if current_user.role == UserRole.ADMIN:
        bons = await db.bons_commande.find().to_list(1000)
    else:
        bons = await db.bons_commande.find({"commercial_id": current_user.id}).to_list(1000)
    
    return [BonCommande(**bon) for bon in bons]

# Chantier Routes
@api_router.post("/chantiers", response_model=Chantier)
async def create_chantier(chantier_data: ChantierCreate, current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.COMMERCIAL]))):
    """Create a new chantier"""
    # Get the bon de commande
    bon = await db.bons_commande.find_one({"id": chantier_data.bon_commande_id})
    if not bon:
        raise HTTPException(status_code=404, detail="Bon de commande not found")
    
    chantier_dict = chantier_data.dict()
    chantier_dict.update({
        "numero": await generate_numero("chantiers", "CH"),
        "client_id": bon["client_id"],
        "commercial_id": bon["commercial_id"]
    })
    
    chantier = Chantier(**chantier_dict)
    await db.chantiers.insert_one(chantier.dict())
    return chantier

@api_router.get("/chantiers", response_model=List[Chantier])
async def get_chantiers(current_user: User = Depends(get_current_user)):
    """Get chantiers (filtered by role)"""
    if current_user.role == UserRole.ADMIN:
        chantiers = await db.chantiers.find().to_list(1000)
    elif current_user.role == UserRole.COMMERCIAL:
        chantiers = await db.chantiers.find({"commercial_id": current_user.id}).to_list(1000)
    else:  # TECHNICIEN
        chantiers = await db.chantiers.find({"technicien_ids": current_user.id}).to_list(1000)
    
    return [Chantier(**chantier) for chantier in chantiers]

@api_router.get("/chantiers/{chantier_id}", response_model=Chantier)
async def get_chantier(chantier_id: str, current_user: User = Depends(get_current_user)):
    """Get a specific chantier"""
    chantier = await db.chantiers.find_one({"id": chantier_id})
    if not chantier:
        raise HTTPException(status_code=404, detail="Chantier not found")
    
    # Check permissions
    if (current_user.role == UserRole.COMMERCIAL and chantier["commercial_id"] != current_user.id) or \
       (current_user.role == UserRole.TECHNICIEN and current_user.id not in chantier["technicien_ids"]):
        raise HTTPException(status_code=403, detail="Access denied")
    
    return Chantier(**chantier)

@api_router.put("/chantiers/{chantier_id}")
async def update_chantier(chantier_id: str, chantier_update: ChantierUpdate, current_user: User = Depends(get_current_user)):
    """Update chantier (status, progression, etc.)"""
    chantier = await db.chantiers.find_one({"id": chantier_id})
    if not chantier:
        raise HTTPException(status_code=404, detail="Chantier not found")
    
    # Check permissions
    if (current_user.role == UserRole.COMMERCIAL and chantier["commercial_id"] != current_user.id) or \
       (current_user.role == UserRole.TECHNICIEN and current_user.id not in chantier["technicien_ids"]):
        raise HTTPException(status_code=403, detail="Access denied")
    
    update_data = {k: v for k, v in chantier_update.dict().items() if v is not None}
    
    await db.chantiers.update_one({"id": chantier_id}, {"$set": update_data})
    return {"message": "Chantier updated successfully"}

# Intervention Routes
@api_router.post("/interventions", response_model=Intervention)
async def create_intervention(intervention_data: InterventionCreate, current_user: User = Depends(get_current_user)):
    """Create a new intervention"""
    # Check if user has access to the chantier
    chantier = await db.chantiers.find_one({"id": intervention_data.chantier_id})
    if not chantier:
        raise HTTPException(status_code=404, detail="Chantier not found")
    
    if current_user.role == UserRole.TECHNICIEN and current_user.id not in chantier["technicien_ids"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    intervention_dict = intervention_data.dict()
    intervention_dict["technicien_id"] = current_user.id
    
    intervention = Intervention(**intervention_dict)
    await db.interventions.insert_one(intervention.dict())
    return intervention

@api_router.get("/interventions", response_model=List[Intervention])
async def get_interventions(current_user: User = Depends(get_current_user)):
    """Get interventions (filtered by role)"""
    if current_user.role == UserRole.ADMIN:
        interventions = await db.interventions.find().to_list(1000)
    else:
        interventions = await db.interventions.find({"technicien_id": current_user.id}).to_list(1000)
    
    return [Intervention(**intervention) for intervention in interventions]

@api_router.put("/interventions/{intervention_id}")
async def update_intervention(intervention_id: str, intervention_update: InterventionUpdate, current_user: User = Depends(get_current_user)):
    """Update intervention"""
    intervention = await db.interventions.find_one({"id": intervention_id})
    if not intervention:
        raise HTTPException(status_code=404, detail="Intervention not found")
    
    # Check permissions
    if current_user.role != UserRole.ADMIN and intervention["technicien_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    update_data = {k: v for k, v in intervention_update.dict().items() if v is not None}
    
    await db.interventions.update_one({"id": intervention_id}, {"$set": update_data})
    return {"message": "Intervention updated successfully"}

# Dashboard Stats Routes
@api_router.get("/dashboard/stats")
async def get_dashboard_stats(current_user: User = Depends(get_current_user)):
    """Get dashboard statistics"""
    stats = {}
    
    if current_user.role == UserRole.ADMIN:
        stats = {
            "total_clients": await db.clients.count_documents({}),
            "total_devis": await db.devis.count_documents({}),
            "devis_acceptes": await db.devis.count_documents({"status": DevisStatus.ACCEPTE}),
            "chantiers_actifs": await db.chantiers.count_documents({"status": ChantierStatus.EN_COURS}),
            "chantiers_termines": await db.chantiers.count_documents({"status": ChantierStatus.TERMINE}),
            "interventions_programmees": await db.interventions.count_documents({"status": InterventionStatus.PROGRAMMEE})
        }
    elif current_user.role == UserRole.COMMERCIAL:
        stats = {
            "mes_clients": await db.clients.count_documents({"commercial_id": current_user.id}),
            "mes_devis": await db.devis.count_documents({"commercial_id": current_user.id}),
            "devis_acceptes": await db.devis.count_documents({"commercial_id": current_user.id, "status": DevisStatus.ACCEPTE}),
            "mes_chantiers": await db.chantiers.count_documents({"commercial_id": current_user.id}),
            "chantiers_actifs": await db.chantiers.count_documents({"commercial_id": current_user.id, "status": ChantierStatus.EN_COURS})
        }
    else:  # TECHNICIEN
        stats = {
            "mes_chantiers": await db.chantiers.count_documents({"technicien_ids": current_user.id}),
            "chantiers_actifs": await db.chantiers.count_documents({"technicien_ids": current_user.id, "status": ChantierStatus.EN_COURS}),
            "mes_interventions": await db.interventions.count_documents({"technicien_id": current_user.id}),
            "interventions_programmees": await db.interventions.count_documents({"technicien_id": current_user.id, "status": InterventionStatus.PROGRAMMEE})
        }
    
    return stats

# Legacy Routes (keep for compatibility)
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
