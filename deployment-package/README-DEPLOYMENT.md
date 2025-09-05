# 🚀 ERP Secura Protect - Package de Déploiement

## 📦 Contenu du package

```
deployment-package/
├── backend/                 # API Python FastAPI
│   ├── server.py           # Application principale
│   ├── init_db.py          # Script d'initialisation DB
│   ├── requirements.txt    # Dépendances Python
│   └── .env.example        # Configuration à adapter
├── frontend/               # Frontend React compilé
│   ├── index.html          # Page principale
│   ├── assets/             # CSS/JS compilés
│   └── test.html           # Page de test
└── scripts/                # Scripts de déploiement
```

## 🌐 Instructions de déploiement

### Option 1: VPS/Serveur dédié (Recommandé)

1. **Transférer les fichiers** via SFTP/SCP
2. **Installer les dépendances** :
   ```bash
   # Python
   pip install -r backend/requirements.txt
   
   # MongoDB
   sudo apt install mongodb-org
   ```

3. **Configuration** :
   ```bash
   cp backend/.env.example backend/.env
   # Éditer backend/.env avec vos paramètres
   ```

4. **Initialiser la base** :
   ```bash
   cd backend && python init_db.py
   ```

5. **Démarrer les services** :
   ```bash
   # Backend
   uvicorn server:app --host 0.0.0.0 --port 8000
   
   # Frontend (serveur web)
   # Pointer votre serveur web vers le dossier frontend/
   ```

### Option 2: Hébergement mutualisé

⚠️ **Limitations** : Pas de support Python/Node.js complet
- Frontend uniquement (statique)
- API externe requise (Firebase, Supabase)

### Option 3: Services Cloud

#### Vercel (Frontend)
```bash
cd frontend && vercel deploy
```

#### Heroku (Full stack)
```bash
# Fichier Procfile requis
echo "web: uvicorn server:app --host 0.0.0.0 --port $PORT" > Procfile
git push heroku main
```

## 🔧 Configuration requise

**Serveur minimum :**
- Ubuntu 20.04+ / CentOS 8+
- Python 3.8+
- MongoDB 4.4+
- 1GB RAM
- 5GB disque

**Variables d'environnement (.env) :**
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=secura_erp
SECRET_KEY=your-super-secret-key-here
```

## 🔐 Sécurité

1. **Changer la SECRET_KEY** dans .env
2. **Configurer HTTPS** (Let's Encrypt)
3. **Firewall** : Ouvrir ports 80, 443, 8000
4. **Backup** base de données régulier

## 📞 Support

- **Tests** : Utilisez `test.html` pour vérifier
- **Logs** : Vérifiez les logs MongoDB et uvicorn
- **API** : Documentation sur `/docs`

## 👤 Comptes par défaut

- **Admin** : admin@secura.com / admin123
- **Commercial** : commercial@secura.com / commercial123
- **Technicien** : tech@secura.com / tech123

⚠️ **Changez ces mots de passe en production !**