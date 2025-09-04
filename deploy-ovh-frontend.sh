#!/bin/bash

# Script pour déployer le frontend sur OVH Hébergement Mutualisé
# Usage: ./deploy-ovh-frontend.sh

echo "🌐 Déploiement Frontend sur OVH Hébergement Mutualisé"
echo "=================================================="

# Vérifier si le dossier frontend existe
if [ ! -d "deployment-package/frontend" ]; then
    echo "❌ Erreur: Dossier frontend non trouvé"
    echo "Assurez-vous d'être dans le dossier contenant deployment-package/"
    exit 1
fi

# Créer un dossier pour l'upload FTP
echo "📁 Préparation des fichiers pour FTP..."
mkdir -p ovh-upload
cp -r deployment-package/frontend/* ovh-upload/

# Créer un fichier .htaccess pour les routes React
cat > ovh-upload/.htaccess << 'EOF'
RewriteEngine On
RewriteBase /

# Handle client-side routing
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Security headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"

# Cache static assets
<filesMatch "\.(css|js|png|jpg|jpeg|gif|ico|svg)$">
    Header set Cache-Control "max-age=31536000, public"
</filesMatch>
EOF

# Créer un fichier de configuration pour l'API externe
cat > ovh-upload/config.js << 'EOF'
// Configuration pour API externe
window.ERP_CONFIG = {
    API_URL: 'https://votre-api-externe.railway.app/api',
    // Remplacez par l'URL de votre API déployée sur Railway/Render
};
EOF

echo "✅ Fichiers préparés dans le dossier 'ovh-upload/'"
echo ""
echo "📋 Étapes suivantes :"
echo "1. Connectez-vous à votre espace client OVH"
echo "2. Allez dans 'Hébergements web' → Votre hébergement"
echo "3. Cliquez sur 'FTP-SSH' puis 'Explorer'"
echo "4. Uploadez tout le contenu du dossier 'ovh-upload/' vers 'www/'"
echo "5. Ou utilisez FileZilla avec vos identifiants FTP OVH"
echo ""
echo "🔧 Configuration FTP OVH :"
echo "   Serveur: ftp.votre-domaine.com (ou ftp.cluster0XX.ovh.net)"
echo "   Port: 21"
echo "   Utilisateur: Votre login OVH"
echo "   Mot de passe: Votre mot de passe FTP"
echo ""
echo "⚠️  N'oubliez pas :"
echo "1. Déployer l'API sur Railway/Render"
echo "2. Mettre à jour l'URL dans config.js"
echo "3. Configurer votre domaine dans l'espace client OVH"

# Afficher la structure des fichiers
echo ""
echo "📁 Structure des fichiers à uploader :"
find ovh-upload -type f | head -10
if [ $(find ovh-upload -type f | wc -l) -gt 10 ]; then
    echo "... et $(expr $(find ovh-upload -type f | wc -l) - 10) autres fichiers"
fi