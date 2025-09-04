#!/usr/bin/env python3
"""
Script d'initialisation de la base de données avec des utilisateurs de test
"""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from datetime import datetime
import uuid

# Configuration
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'secura_erp')

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def init_database():
    """Initialise la base de données avec des données de test"""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    print("🚀 Initialisation de la base de données...")
    
    # Créer les utilisateurs de test
    users = [
        {
            "id": str(uuid.uuid4()),
            "email": "admin@secura.com",
            "hashed_password": pwd_context.hash("admin123"),
            "first_name": "Admin",
            "last_name": "System",
            "role": "admin",
            "is_active": True,
            "created_at": datetime.utcnow(),
            "last_login": None
        },
        {
            "id": str(uuid.uuid4()),
            "email": "commercial@secura.com", 
            "hashed_password": pwd_context.hash("commercial123"),
            "first_name": "Jean",
            "last_name": "Dupont",
            "role": "commercial",
            "is_active": True,
            "created_at": datetime.utcnow(),
            "last_login": None
        },
        {
            "id": str(uuid.uuid4()),
            "email": "tech@secura.com",
            "hashed_password": pwd_context.hash("tech123"),
            "first_name": "Marie",
            "last_name": "Martin", 
            "role": "technicien",
            "is_active": True,
            "created_at": datetime.utcnow(),
            "last_login": None
        }
    ]
    
    # Supprimer les utilisateurs existants et insérer les nouveaux
    await db.users.delete_many({})
    await db.users.insert_many(users)
    print(f"✅ {len(users)} utilisateurs créés")
    
    # Créer quelques clients de test
    commercial_id = users[1]["id"]  # Jean Dupont (commercial)
    
    clients = [
        {
            "id": str(uuid.uuid4()),
            "nom": "Martin",
            "prenom": "Pierre",
            "entreprise": "TechCorp SARL",
            "email": "pierre.martin@techcorp.fr",
            "telephone": "01.23.45.67.89",
            "adresse": "123 Rue de la Paix",
            "ville": "Paris",
            "code_postal": "75001",
            "commercial_id": commercial_id,
            "created_at": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "nom": "Dubois",
            "prenom": "Sophie",
            "entreprise": "Retail Pro",
            "email": "sophie.dubois@retailpro.fr",
            "telephone": "04.56.78.90.12",
            "adresse": "456 Avenue des Champs",
            "ville": "Lyon",
            "code_postal": "69000",
            "commercial_id": commercial_id,
            "created_at": datetime.utcnow()
        }
    ]
    
    await db.clients.delete_many({})
    await db.clients.insert_many(clients)
    print(f"✅ {len(clients)} clients créés")
    
    # Créer quelques devis de test
    devis = [
        {
            "id": str(uuid.uuid4()),
            "numero": "DEV000001",
            "client_id": clients[0]["id"],
            "commercial_id": commercial_id,
            "titre": "Installation système vidéosurveillance",
            "description": "Installation complète d'un système de vidéosurveillance avec 8 caméras HD",
            "items": [
                {
                    "description": "Caméra HD extérieure",
                    "quantite": 8,
                    "prix_unitaire": 250.0,
                    "total": 2000.0
                },
                {
                    "description": "Enregistreur numérique 16 voies",
                    "quantite": 1,
                    "prix_unitaire": 800.0,
                    "total": 800.0
                },
                {
                    "description": "Installation et configuration",
                    "quantite": 1,
                    "prix_unitaire": 1200.0,
                    "total": 1200.0
                }
            ],
            "total_ht": 4000.0,
            "tva": 20.0,
            "total_ttc": 4800.0,
            "status": "accepté",
            "date_creation": datetime.utcnow(),
            "date_validite": datetime(2024, 3, 1),
            "notes": "Installation prévue sous 2 semaines"
        }
    ]
    
    await db.devis.delete_many({})
    await db.devis.insert_many(devis)
    print(f"✅ {len(devis)} devis créés")
    
    # Créer un bon de commande
    bons_commande = [
        {
            "id": str(uuid.uuid4()),
            "numero": "BC000001",
            "devis_id": devis[0]["id"],
            "client_id": clients[0]["id"],
            "commercial_id": commercial_id,
            "date_commande": datetime.utcnow(),
            "date_livraison_prevue": datetime(2024, 2, 15),
            "status": "confirmé",
            "notes": "Livraison prioritaire"
        }
    ]
    
    await db.bons_commande.delete_many({})
    await db.bons_commande.insert_many(bons_commande)
    print(f"✅ {len(bons_commande)} bons de commande créés")
    
    # Créer un chantier
    technicien_id = users[2]["id"]  # Marie Martin (technicien)
    
    chantiers = [
        {
            "id": str(uuid.uuid4()),
            "numero": "CH000001",
            "bon_commande_id": bons_commande[0]["id"],
            "client_id": clients[0]["id"],
            "commercial_id": commercial_id,
            "technicien_ids": [technicien_id],
            "titre": "Installation vidéosurveillance TechCorp",
            "description": "Installation système complet de vidéosurveillance",
            "adresse_chantier": "123 Rue de la Paix, 75001 Paris",
            "date_debut_prevue": datetime(2024, 2, 10),
            "date_fin_prevue": datetime(2024, 2, 12),
            "date_debut_reelle": None,
            "date_fin_reelle": None,
            "status": "planifié",
            "progression": 0,
            "notes": None,
            "created_at": datetime.utcnow()
        }
    ]
    
    await db.chantiers.delete_many({})
    await db.chantiers.insert_many(chantiers)
    print(f"✅ {len(chantiers)} chantiers créés")
    
    # Créer des interventions
    interventions = [
        {
            "id": str(uuid.uuid4()),
            "chantier_id": chantiers[0]["id"],
            "technicien_id": technicien_id,
            "titre": "Installation caméras extérieures",
            "description": "Pose et configuration des 8 caméras extérieures",
            "date_intervention": datetime(2024, 2, 10, 9, 0),
            "duree_prevue": 480,  # 8 heures
            "duree_reelle": None,
            "status": "programmée",
            "notes": None,
            "photos": [],
            "created_at": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "chantier_id": chantiers[0]["id"],
            "technicien_id": technicien_id,
            "titre": "Configuration enregistreur",
            "description": "Installation et configuration de l'enregistreur numérique",
            "date_intervention": datetime(2024, 2, 11, 9, 0),
            "duree_prevue": 240,  # 4 heures
            "duree_reelle": None,
            "status": "programmée",
            "notes": None,
            "photos": [],
            "created_at": datetime.utcnow()
        }
    ]
    
    await db.interventions.delete_many({})
    await db.interventions.insert_many(interventions)
    print(f"✅ {len(interventions)} interventions créées")
    
    client.close()
    print("\n🎉 Base de données initialisée avec succès!")
    print("\n👤 Comptes de test créés:")
    print("   Admin: admin@secura.com / admin123")
    print("   Commercial: commercial@secura.com / commercial123") 
    print("   Technicien: tech@secura.com / tech123")

if __name__ == "__main__":
    asyncio.run(init_database())