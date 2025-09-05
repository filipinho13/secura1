#!/bin/bash

# Script de démarrage pour Secura Protect ERP
echo "🚀 Démarrage de Secura Protect ERP..."

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages colorés
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier si MongoDB est en cours d'exécution
print_status "Vérification de MongoDB..."
if ! pgrep -x "mongod" > /dev/null; then
    print_warning "MongoDB n'est pas en cours d'exécution"
    print_status "Tentative de démarrage de MongoDB..."
    
    # Essayer de démarrer MongoDB selon l'OS
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo systemctl start mongod
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        brew services start mongodb/brew/mongodb-community
    else
        print_error "OS non supporté pour le démarrage automatique de MongoDB"
        print_status "Veuillez démarrer MongoDB manuellement"
        exit 1
    fi
    
    # Attendre que MongoDB soit prêt
    sleep 3
fi

print_success "MongoDB est en cours d'exécution"

# Configuration des variables d'environnement
export MONGO_URL="mongodb://localhost:27017"
export DB_NAME="secura_erp"
export SECRET_KEY="your-secret-key-change-in-production"

print_status "Variables d'environnement configurées"

# Créer le fichier .env pour le backend s'il n'existe pas
if [ ! -f "backend/.env" ]; then
    print_status "Création du fichier .env pour le backend..."
    cat > backend/.env << EOF
MONGO_URL=mongodb://localhost:27017
DB_NAME=secura_erp
SECRET_KEY=your-secret-key-change-in-production
EOF
    print_success "Fichier .env créé"
fi

# Installer les dépendances Python si nécessaire
print_status "Vérification des dépendances Python..."
cd backend
if [ ! -d "venv" ]; then
    print_status "Création de l'environnement virtuel Python..."
    python3 -m venv venv
fi

source venv/bin/activate
pip install -q -r requirements.txt
print_success "Dépendances Python installées"

# Initialiser la base de données
print_status "Initialisation de la base de données..."
python init_db.py

# Démarrer le serveur backend
print_status "Démarrage du serveur backend..."
uvicorn server:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

cd ..

# Installer les dépendances Node.js et démarrer le frontend
print_status "Installation des dépendances frontend..."
cd erp-dashboard

# Vérifier si node_modules existe
if [ ! -d "node_modules" ]; then
    print_status "Installation des packages npm..."
    npm install
fi

print_success "Dépendances frontend installées"

# Démarrer le serveur frontend
print_status "Démarrage du serveur frontend..."
npm run dev &
FRONTEND_PID=$!

cd ..

# Attendre un peu pour que les serveurs démarrent
sleep 3

print_success "🎉 Secura Protect ERP est maintenant en cours d'exécution!"
echo ""
echo "📍 URLs d'accès:"
echo "   Frontend (ERP): http://localhost:3001"
echo "   Backend (API):  http://localhost:8000"
echo "   API Docs:       http://localhost:8000/docs"
echo ""
echo "👤 Comptes de test:"
echo "   Admin:      admin@secura.com / admin123"
echo "   Commercial: commercial@secura.com / commercial123"
echo "   Technicien: tech@secura.com / tech123"
echo ""
echo "⚠️  Pour arrêter les serveurs, appuyez sur Ctrl+C"

# Fonction de nettoyage
cleanup() {
    print_status "Arrêt des serveurs..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    print_success "Serveurs arrêtés"
    exit 0
}

# Capturer Ctrl+C
trap cleanup INT

# Attendre que l'utilisateur appuie sur Ctrl+C
wait