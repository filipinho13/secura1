# 🛡️ Secura Protect ERP

Un système ERP complet pour la gestion d'entreprise de sécurité, vidéosurveillance, alarme et contrôle d'accès.

## 🚀 Fonctionnalités

### 👥 Gestion des Rôles
- **Administrateur** : Accès complet à toutes les fonctionnalités
- **Commercial** : Gestion clients, devis, bons de commande, suivi chantiers
- **Technicien** : Consultation et mise à jour des chantiers, gestion des interventions

### 📊 Modules Principaux

#### 🏢 Gestion Commerciale
- **Clients** : Base de données clients complète
- **Devis** : Création, suivi et validation des devis
- **Bons de commande** : Génération automatique depuis les devis acceptés
- **Statistiques** : Tableaux de bord avec métriques commerciales

#### 🏗️ Gestion des Chantiers
- **Planification** : Création et assignation des chantiers
- **Suivi en temps réel** : Progression, statuts, notes
- **Techniciens** : Assignation multi-techniciens par chantier
- **Géolocalisation** : Adresses des chantiers

#### 🔧 Gestion des Interventions
- **Programmation** : Planification des interventions techniques
- **Suivi** : Temps réel vs prévu, statuts, notes
- **Documentation** : Photos, rapports d'intervention
- **Historique** : Traçabilité complète

### 🎯 Services Couverts
- **Sécurité Privée** : Agents de sécurité, surveillance
- **Vidéosurveillance** : Caméras HD/4K, monitoring, stockage
- **Contrôle d'Accès** : Badges RFID, biométrie, gestion centralisée
- **Détection Intrusion** : Alarmes intelligentes, télésurveillance

## 🛠️ Architecture Technique

### Backend (FastAPI + MongoDB)
- **API REST** avec authentification JWT
- **Base de données** MongoDB avec Motor (async)
- **Sécurité** : Hashage bcrypt, gestion des rôles
- **Documentation** automatique avec Swagger/OpenAPI

### Frontend (React + Vite)
- **Interface moderne** avec Tailwind CSS
- **Gestion d'état** avec React Query
- **Routing** avec React Router
- **Notifications** avec React Hot Toast
- **Responsive** : Compatible mobile/tablette

## 📦 Installation

### Prérequis
- Python 3.8+
- Node.js 16+
- MongoDB 4.4+

### Installation Rapide

1. **Cloner le projet**
```bash
git clone <repository-url>
cd secura-protect-erp
```

2. **Lancer l'ERP**
```bash
./start_erp.sh
```

Le script automatique va :
- Vérifier et démarrer MongoDB
- Installer les dépendances Python et Node.js
- Initialiser la base de données avec des données de test
- Démarrer le backend (port 8000) et frontend (port 3001)

### Installation Manuelle

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou venv\Scripts\activate  # Windows
pip install -r requirements.txt

# Configuration
export MONGO_URL="mongodb://localhost:27017"
export DB_NAME="secura_erp"

# Initialiser la DB
python init_db.py

# Démarrer le serveur
uvicorn server:app --reload
```

#### Frontend
```bash
cd erp-dashboard
npm install
npm run dev
```

## 🔑 Comptes de Test

| Rôle | Email | Mot de passe | Permissions |
|------|-------|--------------|-------------|
| Admin | admin@secura.com | admin123 | Toutes |
| Commercial | commercial@secura.com | commercial123 | Clients, Devis, Chantiers |
| Technicien | tech@secura.com | tech123 | Chantiers, Interventions |

## 🌐 URLs d'Accès

- **ERP Dashboard** : http://localhost:3001
- **API Backend** : http://localhost:8000
- **Documentation API** : http://localhost:8000/docs

## 📱 Captures d'Écran

### Tableau de Bord
Interface principale avec métriques et actions rapides selon le rôle utilisateur.

### Gestion Clients
- Création et modification de clients
- Recherche et filtres avancés
- Historique des interactions

### Devis & Commandes
- Créateur de devis avec articles multiples
- Calculs automatiques HT/TTC
- Workflow de validation
- Génération de bons de commande

### Chantiers
- Vue en cartes avec progression visuelle
- Assignation de techniciens
- Suivi temps réel
- Géolocalisation

### Interventions
- Planification par technicien
- Mise à jour de statuts
- Documentation avec photos
- Rapports d'intervention

## 🔧 Configuration

### Variables d'Environnement

#### Backend (.env)
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=secura_erp
SECRET_KEY=your-secret-key-here
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000/api
```

### Base de Données

La base MongoDB utilise les collections suivantes :
- `users` : Utilisateurs et authentification
- `clients` : Base clients
- `devis` : Devis commerciaux
- `bons_commande` : Bons de commande
- `chantiers` : Chantiers et projets
- `interventions` : Interventions techniques
- `contact_inquiries` : Demandes de contact (site vitrine)

## 🔐 Sécurité

- **Authentification JWT** avec expiration
- **Hashage des mots de passe** avec bcrypt
- **Autorisation basée sur les rôles** (RBAC)
- **Validation des données** avec Pydantic
- **CORS configuré** pour le développement

## 🚀 Déploiement

### Production
1. Configurer une base MongoDB sécurisée
2. Générer une `SECRET_KEY` forte
3. Construire le frontend : `npm run build`
4. Déployer avec un reverse proxy (Nginx)
5. Utiliser un gestionnaire de processus (PM2, systemd)

### Docker (optionnel)
```bash
# À venir : configuration Docker Compose
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 Roadmap

### Version 2.0
- [ ] Module de facturation
- [ ] Intégration comptable
- [ ] Rapports PDF automatiques
- [ ] Notifications push
- [ ] API mobile
- [ ] Géolocalisation temps réel
- [ ] Signature électronique
- [ ] Intégration caméras IP

### Version 2.1
- [ ] Multi-entreprises
- [ ] Workflow avancés
- [ ] IA pour prédictions
- [ ] Intégrations ERP externes

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

Pour toute question ou problème :
- Ouvrir une issue GitHub
- Contact : support@secura-protect.fr
- Documentation : [Wiki du projet]

## 🙏 Remerciements

- FastAPI pour l'API backend
- React et Vite pour le frontend
- MongoDB pour la base de données
- Tailwind CSS pour le design
- Lucide React pour les icônes

---

**Secura Protect ERP** - Solution complète pour entreprises de sécurité 🛡️