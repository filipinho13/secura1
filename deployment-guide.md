# 🚀 Guide de Déploiement - ERP Secura Protect

## 📦 Fichiers à déployer

### Backend (API)
- `backend/` - Serveur FastAPI Python
- `backend/requirements.txt` - Dépendances Python
- `backend/server.py` - Application principale
- `backend/.env` - Configuration (à adapter)

### Frontend 
- `erp-dashboard/dist/` - Version compilée (après `npm run build`)
- Ou `erp-dashboard/` - Code source React

### Base de données
- Scripts d'initialisation dans `backend/init_db.py`
- Collections MongoDB nécessaires

## 🌐 Types d'hébergement supportés

### 1. VPS/Serveur dédié (Recommandé)
✅ Support complet Node.js + Python + MongoDB
✅ Contrôle total
✅ Performance optimale

**Commandes d'installation :**
```bash
# Sur Ubuntu/Debian
sudo apt update
sudo apt install python3 python3-pip nodejs npm mongodb-org
```

### 2. Hébergement Cloud
✅ **Vercel** - Frontend uniquement
✅ **Heroku** - Full stack
✅ **Railway** - Full stack
✅ **DigitalOcean** - VPS

### 3. Hébergement mutualisé
⚠️ Limité - Frontend statique seulement
❌ Pas de support Python/Node.js complet

## 📋 Checklist de déploiement

- [ ] Accès SSH/FTP confirmé
- [ ] Support Node.js vérifié
- [ ] Support Python vérifié  
- [ ] Base de données configurée
- [ ] Nom de domaine configuré
- [ ] Certificat SSL installé
- [ ] Variables d'environnement configurées
- [ ] Tests de connectivité effectués

## 🔧 Configuration requise

**Minimum :**
- Node.js 16+
- Python 3.8+
- MongoDB 4.4+ ou MySQL 8+
- 1GB RAM
- 5GB espace disque

**Recommandé :**
- Node.js 18+
- Python 3.10+
- MongoDB 6+
- 2GB RAM
- 10GB espace disque