#!/bin/bash

# Script de déploiement pour VPS/Serveur dédié
# Usage: ./deploy-vps.sh

set -e

echo "🚀 Déploiement ERP Secura Protect sur VPS"
echo "=========================================="

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Vérifications préalables
echo -e "${BLUE}[INFO]${NC} Vérification du système..."

# Vérifier si on est root ou sudo
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}[ERROR]${NC} Ce script doit être exécuté avec sudo"
   exit 1
fi

# Mettre à jour le système
echo -e "${BLUE}[INFO]${NC} Mise à jour du système..."
apt update && apt upgrade -y

# Installer les dépendances système
echo -e "${BLUE}[INFO]${NC} Installation des dépendances..."
apt install -y python3 python3-pip python3-venv nginx curl gnupg

# Installer MongoDB
echo -e "${BLUE}[INFO]${NC} Installation de MongoDB..."
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
apt update
apt install -y mongodb-org

# Démarrer MongoDB
systemctl start mongod
systemctl enable mongod

# Créer un utilisateur pour l'application
echo -e "${BLUE}[INFO]${NC} Création de l'utilisateur 'secura'..."
useradd -m -s /bin/bash secura || echo "Utilisateur existe déjà"

# Copier les fichiers de l'application
echo -e "${BLUE}[INFO]${NC} Copie des fichiers..."
cp -r ../backend /home/secura/
cp -r ../frontend /var/www/secura-erp/
chown -R secura:secura /home/secura/backend
chown -R www-data:www-data /var/www/secura-erp

# Installer les dépendances Python
echo -e "${BLUE}[INFO]${NC} Installation des dépendances Python..."
cd /home/secura/backend
sudo -u secura python3 -m venv venv
sudo -u secura venv/bin/pip install -r requirements.txt

# Configuration
echo -e "${BLUE}[INFO]${NC} Configuration de l'application..."
if [ ! -f /home/secura/backend/.env ]; then
    cp .env.example .env
    echo -e "${YELLOW}[WARNING]${NC} Configurez le fichier /home/secura/backend/.env"
fi

# Initialiser la base de données
echo -e "${BLUE}[INFO]${NC} Initialisation de la base de données..."
cd /home/secura/backend
sudo -u secura venv/bin/python init_db.py

# Configuration Nginx
echo -e "${BLUE}[INFO]${NC} Configuration de Nginx..."
cat > /etc/nginx/sites-available/secura-erp << 'EOF'
server {
    listen 80;
    server_name votre-domaine.com www.votre-domaine.com;

    # Frontend
    location / {
        root /var/www/secura-erp;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # API Backend
    location /api/ {
        proxy_pass http://localhost:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Documentation API
    location /docs {
        proxy_pass http://localhost:8000/docs;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
EOF

ln -sf /etc/nginx/sites-available/secura-erp /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# Service systemd pour l'API
echo -e "${BLUE}[INFO]${NC} Configuration du service systemd..."
cat > /etc/systemd/system/secura-erp.service << 'EOF'
[Unit]
Description=Secura Protect ERP API
After=network.target mongod.service
Requires=mongod.service

[Service]
Type=exec
User=secura
Group=secura
WorkingDirectory=/home/secura/backend
Environment=PATH=/home/secura/backend/venv/bin
ExecStart=/home/secura/backend/venv/bin/uvicorn server:app --host 127.0.0.1 --port 8000
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable secura-erp
systemctl start secura-erp

echo -e "${GREEN}[SUCCESS]${NC} Déploiement terminé !"
echo ""
echo "📍 Configuration finale requise :"
echo "1. Éditez /home/secura/backend/.env avec vos paramètres"
echo "2. Remplacez 'votre-domaine.com' dans /etc/nginx/sites-available/secura-erp"
echo "3. Installez un certificat SSL (Let's Encrypt recommandé)"
echo "4. Redémarrez les services : systemctl restart secura-erp nginx"
echo ""
echo "🌐 URLs :"
echo "   Frontend: http://votre-domaine.com"
echo "   API: http://votre-domaine.com/api/"
echo "   Docs: http://votre-domaine.com/docs"