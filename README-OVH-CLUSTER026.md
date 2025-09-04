# 🛡️ ERP Secura Protect - Déploiement OVH cluster026

## 🎯 Configuration détectée
- **Hébergement** : OVH Mutualisé
- **Serveur FTP** : ftp.cluster026.hosting.ovh.net
- **Solution** : Frontend OVH + API externe gratuite

## 🚀 Déploiement en 10 minutes

### **1. Déployer l'API Backend (5 min)**

#### Sur Railway (Gratuit)
1. **Va sur** : https://railway.app
2. **Connecte-toi** avec GitHub/Google
3. **New Project** → **Deploy from GitHub repo**
4. **Upload** le dossier `deployment-package/backend/`
5. **Variables d'environnement** (Settings → Variables) :
   ```
   MONGO_URL=mongodb://localhost:27017
   DB_NAME=secura_erp
   SECRET_KEY=change-moi-en-production-123456
   ```
6. **Deploy** → Railway génère une URL : `https://xxx.railway.app`

### **2. Upload Frontend sur OVH (3 min)**

#### Via FileZilla
1. **Télécharge FileZilla** : https://filezilla-project.org
2. **Connexion FTP** :
   - **Serveur** : `ftp.cluster026.hosting.ovh.net`
   - **Port** : `21`
   - **Utilisateur** : Ton login OVH
   - **Mot de passe** : Ton mot de passe FTP OVH

3. **Upload** :
   - Connecte-toi
   - Va dans `www/` ou `public_html/`
   - Upload tout le contenu de `ovh-upload/`

### **3. Configuration finale (2 min)**

1. **Récupère l'URL** de ton API Railway : `https://xxx.railway.app`
2. **Modifie** le fichier `config.js` :
   ```javascript
   window.ERP_CONFIG = {
       API_URL: 'https://ton-url-railway.railway.app/api'
   };
   ```
3. **Re-upload** le fichier `config.js` modifié

## 🌐 Résultat final

- **🎯 ERP Dashboard** : https://ton-domaine.com
- **🧪 Page de test** : https://ton-domaine.com/test.html
- **🔧 API Backend** : https://ton-url-railway.railway.app/api
- **📚 Documentation** : https://ton-url-railway.railway.app/docs

## 👤 Comptes de connexion

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| **Admin** | admin@secura.com | admin123 |
| **Commercial** | commercial@secura.com | commercial123 |
| **Technicien** | tech@secura.com | tech123 |

## 📁 Fichiers prêts pour upload

Dans le dossier `ovh-upload/` :
- `index.html` - Page principale
- `assets/` - CSS/JS compilés
- `test.html` - Page de test
- `config.js` - Configuration API
- `.htaccess` - Redirection routes

## 💰 Coûts

- **OVH** : Ton abonnement actuel (0€ supplémentaire)
- **Railway** : Gratuit (500h/mois)
- **Total** : **0€ par mois** ! 🎉

## 🔧 Dépannage

### Si l'ERP ne se charge pas :
1. Vérifie https://ton-domaine.com/test.html
2. Ouvre F12 → Console pour voir les erreurs
3. Vérifie que l'API fonctionne : https://ton-url-railway.railway.app/api

### Si l'API ne répond pas :
1. Va sur le dashboard Railway
2. Vérifie les logs
3. Redémarre le service si nécessaire

## 🆘 Support

- **Problème OVH** : Espace client OVH
- **Problème Railway** : Dashboard Railway → Logs
- **Problème ERP** : Utilise la page de test

---

**Ton ERP sera accessible 24h/7j gratuitement ! 🚀**