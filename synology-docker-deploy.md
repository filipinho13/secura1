# 🐳 ERP Secura Protect - Déploiement Synology Docker

## 📋 Prérequis
- **Synology DSM 7.0+**
- **Container Manager** installé (ex-Docker)
- **Web Station** installé
- **4GB RAM minimum** recommandé

## 🚀 Déploiement complet en conteneurs

### 1. Préparation des fichiers

#### Structure sur le Synology
```
/volume1/docker/secura-erp/
├── backend/
│   ├── Dockerfile
│   ├── server.py
│   ├── requirements.txt
│   └── .env
├── frontend/
│   └── dist/ (fichiers compilés)
├── docker-compose.yml
└── mongodb-data/ (persistance)
```

### 2. Dockerfile Backend
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 3. Docker Compose
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:7.0
    container_name: secura-mongodb
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: secura123
    volumes:
      - ./mongodb-data:/data/db
    ports:
      - "27017:27017"

  backend:
    build: ./backend
    container_name: secura-backend
    restart: unless-stopped
    environment:
      MONGO_URL: mongodb://admin:secura123@mongodb:27017
      DB_NAME: secura_erp
      SECRET_KEY: synology-secura-2024-key
    depends_on:
      - mongodb
    ports:
      - "8000:8000"

  frontend:
    image: nginx:alpine
    container_name: secura-frontend
    restart: unless-stopped
    volumes:
      - ./frontend/dist:/usr/share/nginx/html
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
    ports:
      - "3000:80"
    depends_on:
      - backend
```

### 4. Configuration Nginx
```nginx
server {
    listen 80;
    server_name localhost;

    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://backend:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /docs {
        proxy_pass http://backend:8000/docs;
        proxy_set_header Host $host;
    }
}
```

## 🌐 Accès final
- **ERP** : http://synology-ip:3000
- **API** : http://synology-ip:8000/api
- **Docs** : http://synology-ip:8000/docs