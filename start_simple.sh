#!/bin/bash

echo "🚀 Démarrage simple de l'ERP Secura Protect..."

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}[INFO]${NC} Vérification des processus..."

# Tuer les anciens processus
pkill -f "mongod" 2>/dev/null
pkill -f "uvicorn" 2>/dev/null  
pkill -f "vite" 2>/dev/null
sleep 2

echo -e "${BLUE}[INFO]${NC} Démarrage de MongoDB..."
sudo -u mongodb mongod --dbpath /data/db --bind_ip 127.0.0.1 --port 27017 --fork --logpath /var/log/mongodb.log

echo -e "${BLUE}[INFO]${NC} Démarrage du Backend..."
cd /workspace/backend
source venv/bin/activate
uvicorn server:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

echo -e "${BLUE}[INFO]${NC} Démarrage du Frontend..."
cd /workspace/erp-dashboard
npx vite --host 0.0.0.0 --port 3001 &
FRONTEND_PID=$!

sleep 5

echo -e "${GREEN}[SUCCESS]${NC} ERP démarré !"
echo ""
echo "📍 URLs d'accès:"
echo "   🎯 ERP Dashboard: http://localhost:3001"
echo "   🎯 Page de test:  http://localhost:3001/test.html"
echo "   🔧 API Backend:   http://localhost:8000/api/"
echo "   📚 Documentation: http://localhost:8000/docs"
echo ""
echo "👤 Comptes de test:"
echo "   Admin:      admin@secura.com / admin123"
echo "   Commercial: commercial@secura.com / commercial123"
echo "   Technicien: tech@secura.com / tech123"
echo ""
echo "⚠️  Pour arrêter: Ctrl+C"

# Attendre Ctrl+C
trap 'echo -e "\n${BLUE}[INFO]${NC} Arrêt des serveurs..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0' INT
wait