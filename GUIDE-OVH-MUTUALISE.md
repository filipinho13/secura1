# 🌐 Guide Déploiement OVH Hébergement Mutualisé

## 📋 Votre configuration détectée
- **Serveur FTP** : ftp.cluster026.hosting.ovh.net
- **Type** : Hébergement web mutualisé
- **Limitations** : Pas de Python/Node.js, pas de MongoDB

## 🚀 Solution complète en 3 étapes

### **Étape 1 : Déployer l'API Backend (GRATUIT)**

#### Option A - Railway (Recommandé)
1. Va sur https://railway.app
2. Connecte-toi avec GitHub
3. Clique "Deploy from GitHub repo"
4. Upload le dossier `backend/` 
5. Railway détecte automatiquement Python
6. Ajoute ces variables d'environnement :
   ```
   MONGO_URL=mongodb://localhost:27017
   DB_NAME=secura_erp
   SECRET_KEY=ton-secret-key-fort
   ```
7. Railway fournit une URL comme : `https://ton-projet.railway.app`

#### Option B - Render
1. Va sur https://render.com
2. "New Web Service" → Upload `backend/`
3. Configure les variables d'environnement
4. Deploy automatique

### **Étape 2 : Upload du Frontend sur OVH**

#### Via FileZilla (Recommandé)
1. **Télécharge FileZilla** : https://filezilla-project.org
2. **Configure la connexion** :
   - **Serveur** : ftp.cluster026.hosting.ovh.net
   - **Port** : 21
   - **Utilisateur** : ton-login-ovh
   - **Mot de passe** : ton-mot-de-passe-ftp

3. **Upload les fichiers** :
   - Connecte-toi à ton FTP
   - Va dans le dossier `www/` (ou `public_html/`)
   - Upload tout le contenu de `ovh-upload/`

#### Via l'interface OVH
1. **Espace client OVH** : https://www.ovh.com/manager
2. **Web Cloud** → **Hébergements web**
3. **Ton hébergement** → **FTP-SSH**
4. **Explorateur de fichiers**
5. Upload dans `www/`

### **Étape 3 : Configuration finale**

1. **Récupère l'URL de ton API** (Railway/Render)
2. **Modifie le fichier** `ovh-upload/config.js` :
   ```javascript
   window.ERP_CONFIG = {
       API_URL: 'https://ton-projet.railway.app/api'
   };
   ```
3. **Re-upload** le fichier `config.js` modifié

## 🌐 URLs finales
- **ERP** : https://ton-domaine.com
- **Test** : https://ton-domaine.com/test.html
- **API** : https://ton-projet.railway.app/api

## 🔑 Comptes de connexion
- **Admin** : admin@secura.com / admin123
- **Commercial** : commercial@secura.com / commercial123
- **Technicien** : tech@secura.com / tech123

## 💰 Coûts
- **OVH** : Ton abonnement actuel (0€ supplémentaire)
- **Railway** : Gratuit jusqu'à 500h/mois
- **Render** : Gratuit avec limitations
- **Total** : 0€ par mois !

## 🆘 Support
- **Test local** : http://localhost:5173
- **API docs** : https://ton-projet.railway.app/docs
- **Logs Railway** : Dashboard Railway
- **Support OVH** : Espace client