# 🏠 ERP Secura Protect - Déploiement Synology Simple

## 🎯 Solution la plus simple

### Frontend sur Synology + API externe
- **Frontend** : Web Station Synology (chez toi)
- **Backend** : Railway/Render (gratuit, externe)
- **Avantages** : Simple, fiable, pas de maintenance serveur

## 📋 Étapes

### 1. Frontend sur Synology
1. **Installer Web Station**
2. **Créer un site web** :
   - Nom : secura-erp
   - Port : 8080
   - Dossier : /web/secura-erp
3. **Uploader** le contenu de `ovh-upload/` vers `/web/secura-erp/`

### 2. API externe (gratuit)
1. **Railway.app** : Backend Python + MongoDB
2. **Modifier** `config.js` avec l'URL Railway
3. **Résultat** : API disponible 24h/7j

### 3. Accès externe (optionnel)
1. **DDNS Synology** : mon-nas.synology.me
2. **Port forwarding** : 8080 → Synology
3. **Certificat SSL** : Let's Encrypt via DSM

## 🌐 URLs finales
- **Local** : http://192.168.x.x:8080
- **Externe** : https://mon-nas.synology.me:8080
- **API** : https://xxx.railway.app/api

## 💰 Coût : 0€
- **Synology** : Déjà payé
- **Railway** : Gratuit
- **DDNS** : Gratuit