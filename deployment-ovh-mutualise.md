# 🌐 Déploiement OVH Hébergement Mutualisé

## ⚠️ Limitations
- Pas de support Python/Node.js complet
- Pas de base de données MongoDB
- Frontend statique uniquement

## 💡 Solution Hybride Recommandée

### 1. Frontend sur OVH Mutualisé
- Upload du dossier `frontend/` via FTP
- Domaine pointé vers OVH

### 2. Backend sur service externe
**Options gratuites :**
- **Railway** : https://railway.app (MongoDB inclus)
- **Render** : https://render.com
- **Heroku** : https://heroku.com (limité gratuit)

### 3. Base de données externe
- **MongoDB Atlas** (gratuit jusqu'à 512MB)
- **PlanetScale** (MySQL compatible)

## 📁 Fichiers à uploader sur OVH
```
public_html/
├── index.html
├── assets/
│   ├── index-xxx.css
│   └── index-xxx.js
└── test.html
```

## 🔧 Configuration
1. **Frontend** : Upload via FileZilla/FTP
2. **Backend** : Deploy sur Railway/Render  
3. **DNS** : Pointer ton domaine vers OVH
4. **API** : Configurer l'URL de l'API externe

## 💰 Coût
- **OVH** : Ton abonnement actuel
- **Backend** : Gratuit (Railway/Render)
- **Base de données** : Gratuit (MongoDB Atlas)