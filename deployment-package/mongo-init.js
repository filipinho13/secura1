// Script d'initialisation MongoDB pour Docker
db = db.getSiblingDB('secura_erp');

// Créer un utilisateur pour l'application
db.createUser({
  user: 'secura_app',
  pwd: 'secura123',
  roles: [
    {
      role: 'readWrite',
      db: 'secura_erp'
    }
  ]
});

print('MongoDB initialized for Secura ERP');