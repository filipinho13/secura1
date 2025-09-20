## AI Security Agent (Chat + WhatsApp)

Service FastAPI pour gérer un agent IA 24/7 autour de la vidéosurveillance, du contrôle d'accès et des alarmes. Il unifie le tchat du site web et WhatsApp, classe les demandes, collecte les informations clés, crée des tickets, et envoie des confirmations.

### Fonctionnalités
- Chat web embarquable (widget) et webhook WhatsApp
- NLU (règles FR) pour intents: vidéosurveillance, contrôle d'accès, alarme
- Collecte d'informations: type de demande (devis, installation, maintenance, panne), coordonnées, localisation
- Persistance SQLite (tickets + messages)
- Endpoints admin pour lister tickets/messages

### Prérequis
- Python 3.11+
- Compte WhatsApp Business Cloud API

### Installation
```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Éditez `.env` et configurez:
- `WHATSAPP_VERIFY_TOKEN` (pour la vérification du webhook)
- `WHATSAPP_TOKEN` (Bearer token API Meta)
- `WHATSAPP_PHONE_NUMBER_ID`

### Lancer le service
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

- Health: `GET /health`
- Webhook WhatsApp: `GET/POST /api/whatsapp/webhook`
- Chat web API: `POST /api/chat/send`
- Admin: `GET /api/admin/tickets`, `GET /api/admin/tickets/{ticket_id}/messages`
- Widget: ouvrir `http://localhost:8000/static/widget.html`

### Déploiement du webhook WhatsApp
1. Hébergez l'app (HTTPS public). Exemple: Fly.io, Render.com, Railway, Vercel (Functions), ou votre serveur.
2. Configurez l'URL du webhook dans Meta: `https://votre-domaine/api/whatsapp/webhook` et `WHATSAPP_VERIFY_TOKEN`.
3. Donnez les permissions et abonnez-vous aux événements `messages`.

### Personnalisation NLU
Voir `app/agent.py` pour enrichir les synonymes et les questions.

### Sécurité
- Ajoutez un secret admin si vous exposez les endpoints admin.
- Validez la signature si vous utilisez l'en-tête `X-Hub-Signature-256` (non implémenté ici, optionnel selon votre config Meta).

### Licence
MIT
