# 🏠 ERP Secura Protect - Guide Synology NAS

## 🎯 3 Solutions pour ton Synology

### **Solution 1 - Docker Complet (Recommandé)**
- ✅ **Contrôle total**
- ✅ **Performance optimale**
- ✅ **Base de données locale**
- ⚠️ **Prérequis** : DSM 7.0+, 4GB RAM

### **Solution 2 - Web Station + API externe**
- ✅ **Simple à installer**
- ✅ **Fonctionne sur DSM 6.x+**
- ✅ **Maintenance réduite**
- ⚠️ **Dépendant d'Internet** pour l'API

### **Solution 3 - Frontend uniquement**
- ✅ **Très simple**
- ✅ **Compatible tous Synology**
- ⚠️ **API externe obligatoire**

---

## 🐳 **SOLUTION 1 - Docker Complet**

### Prérequis
- **Synology DSM 7.0+**
- **Container Manager** (ex-Docker)
- **4GB RAM minimum**
- **SSH activé**

### Installation

#### 1. Préparation SSH
```bash
# Connexion SSH au Synology
ssh admin@192.168.x.x

# Créer la structure
sudo mkdir -p /volume1/docker/secura-erp
cd /volume1/docker/secura-erp
```

#### 2. Upload des fichiers
- **Via SFTP/SCP** : Upload `deployment-package/` vers `/volume1/docker/secura-erp/`
- **Via File Station** : Glisser-déposer les fichiers

#### 3. Démarrage
```bash
cd /volume1/docker/secura-erp
sudo docker-compose up -d
```

#### 4. Initialisation de la base
```bash
# Attendre 30 secondes que MongoDB démarre
sudo docker exec secura-backend python init_db.py
```

### URLs d'accès
- **ERP** : http://synology-ip:3000
- **API** : http://synology-ip:8000/api
- **Docs** : http://synology-ip:8000/docs

---

## 🌐 **SOLUTION 2 - Web Station + API externe**

### Prérequis
- **Web Station** installé
- **Compte Railway/Render** (gratuit)

### Installation

#### 1. Web Station
1. **Package Center** → **Web Station** → **Installer**
2. **Web Station** → **Portail Web** → **Créer**
   - **Nom** : secura-erp
   - **Port HTTP** : 8080
   - **Dossier racine** : web/secura-erp

#### 2. Upload Frontend
1. **File Station** → `/web/secura-erp/`
2. **Upload** le contenu de `ovh-upload/`

#### 3. API externe
1. **Railway.app** → Deploy `backend/`
2. **Modifier** `config.js` avec l'URL Railway
3. **Re-upload** `config.js`

### URLs d'accès
- **ERP** : http://synology-ip:8080
- **API** : https://xxx.railway.app/api

---

## 📱 **SOLUTION 3 - Frontend uniquement**

### Installation ultra-simple

#### 1. Web Station basique
1. **Web Station** → **Portail Web** → **Créer**
2. **Upload** `ovh-upload/` vers `/web/`

#### 2. API Railway
1. **Deploy** backend sur Railway
2. **Config** `config.js` avec URL Railway

### Avantages
- ✅ **Installation 5 minutes**
- ✅ **Compatible DSM 6.x+**
- ✅ **Aucune maintenance**

---

## 🔐 **Accès externe (toutes solutions)**

### 1. DDNS Synology
1. **Panneau de configuration** → **Accès externe** → **DDNS**
2. **Ajouter** : `mon-nas.synology.me`

### 2. Port forwarding
1. **Routeur** → **Port forwarding**
2. **Port externe** 443 → **Synology** port 3000/8080

### 3. Certificat SSL
1. **Panneau de configuration** → **Sécurité** → **Certificat**
2. **Let's Encrypt** → Certificat automatique

## 🌐 **URLs finales**
- **Local** : http://192.168.x.x:3000
- **Externe** : https://mon-nas.synology.me
- **Mobile** : Accès depuis n'importe où !

---

## 💡 **Recommandation selon ton modèle**

### **DS220+, DS720+, DS920+, DS1520+**
→ **Solution 1 (Docker)** - Performance optimale

### **DS218, DS418, modèles ARM**
→ **Solution 2 (Web Station + API externe)** - Plus léger

### **Modèles anciens (DSM 6.x)**
→ **Solution 3 (Frontend uniquement)** - Compatible

---

## 🆘 **Support**

### **Logs Docker**
```bash
sudo docker-compose logs -f backend
sudo docker-compose logs -f mongodb
```

### **Restart services**
```bash
sudo docker-compose restart
```

### **Backup**
```bash
sudo docker exec secura-mongodb mongodump --out /data/backup
```

---

**Dis-moi quel modèle de Synology tu as et je te guide précisément ! 🚀**