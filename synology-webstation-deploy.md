# 🌐 ERP Secura Protect - Déploiement Synology Web Station

## 📋 Prérequis
- **Web Station** installé
- **Python 3.8+** installé (Package Center)
- **MariaDB 10** ou **PostgreSQL** (alternative à MongoDB)

## 🚀 Déploiement avec Web Station

### 1. Installation des packages
- **Web Station**
- **Python 3.9**
- **MariaDB 10** ou **PostgreSQL**
- **phpMyAdmin** (pour gérer la DB)

### 2. Structure des fichiers
```
/volume1/web/secura-erp/
├── public/          # Frontend (accessible web)
│   ├── index.html
│   ├── assets/
│   └── config.js
├── api/            # Backend Python
│   ├── server.py
│   ├── requirements.txt
│   └── .env
└── scripts/
    └── install.sh
```

### 3. Configuration Web Station
1. **Ouvrir Web Station**
2. **Créer un portail web**
   - **Nom** : secura-erp
   - **Port** : 8080
   - **Dossier racine** : /web/secura-erp/public
3. **Activer Python** pour ce portail

### 4. Base de données alternative
```sql
-- MariaDB au lieu de MongoDB
CREATE DATABASE secura_erp;
CREATE USER 'secura'@'localhost' IDENTIFIED BY 'password123';
GRANT ALL PRIVILEGES ON secura_erp.* TO 'secura'@'localhost';
```

### 5. Configuration backend
```python
# Adapter server.py pour MariaDB/PostgreSQL
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Au lieu de MongoDB
DATABASE_URL = "mysql://secura:password123@localhost/secura_erp"
engine = create_engine(DATABASE_URL)
```

## 🌐 Accès final
- **ERP** : http://synology-ip:8080
- **API** : http://synology-ip:8080/api
- **DB Admin** : http://synology-ip:8081 (phpMyAdmin)