# 🚀 Déploiement OVH VPS

## ✅ Avantages VPS OVH
- Contrôle total du serveur
- Support Python + Node.js
- Installation MongoDB possible
- Certificat SSL Let's Encrypt
- Performance optimale

## 📋 Prérequis
- **VPS** avec Ubuntu 20.04+ ou Debian 11+
- **Accès SSH** (fourni par OVH)
- **Domaine** pointé vers l'IP du VPS

## 🔧 Instructions de déploiement

### 1. Connexion SSH
```bash
ssh ubuntu@votre-ip-vps
# ou
ssh root@votre-ip-vps
```

### 2. Upload de l'archive
```bash
# Sur votre PC
scp secura-erp-deployment.tar.gz ubuntu@votre-ip-vps:/home/ubuntu/

# Sur le VPS
cd /home/ubuntu
tar -xzf secura-erp-deployment.tar.gz
cd deployment-package
```

### 3. Exécution du script automatique
```bash
sudo chmod +x scripts/deploy-vps.sh
sudo ./scripts/deploy-vps.sh
```

### 4. Configuration finale
```bash
# Éditer la configuration
sudo nano /home/secura/backend/.env

# Configurer Nginx avec votre domaine
sudo nano /etc/nginx/sites-available/secura-erp
# Remplacer "votre-domaine.com" par votre vrai domaine

# Redémarrer les services
sudo systemctl restart secura-erp nginx
```

### 5. SSL Let's Encrypt
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d votre-domaine.com -d www.votre-domaine.com
```

## 🌐 Résultat final
- **Frontend** : https://votre-domaine.com
- **API** : https://votre-domaine.com/api/
- **Docs** : https://votre-domaine.com/docs

## 🔒 Sécurité
- HTTPS automatique
- Firewall configuré
- Services isolés
- Backup automatique recommandé