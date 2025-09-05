#!/usr/bin/env python3
"""
Script de test pour vérifier le bon fonctionnement de l'ERP
"""
import requests
import json
import sys
from datetime import datetime

# Configuration
API_BASE = "http://localhost:8000/api"
FRONTEND_URL = "http://localhost:3001"

def test_api_health():
    """Test la santé de l'API"""
    try:
        response = requests.get(f"{API_BASE}/", timeout=5)
        if response.status_code == 200:
            print("✅ API Backend accessible")
            return True
        else:
            print(f"❌ API Backend erreur: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ API Backend non accessible")
        return False
    except Exception as e:
        print(f"❌ Erreur API: {e}")
        return False

def test_frontend():
    """Test l'accessibilité du frontend"""
    try:
        response = requests.get(FRONTEND_URL, timeout=5)
        if response.status_code == 200:
            print("✅ Frontend accessible")
            return True
        else:
            print(f"❌ Frontend erreur: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Frontend non accessible")
        return False
    except Exception as e:
        print(f"❌ Erreur Frontend: {e}")
        return False

def test_authentication():
    """Test l'authentification avec les comptes de test"""
    test_accounts = [
        {"email": "admin@secura.com", "password": "admin123", "role": "admin"},
        {"email": "commercial@secura.com", "password": "commercial123", "role": "commercial"},
        {"email": "tech@secura.com", "password": "tech123", "role": "technicien"}
    ]
    
    success_count = 0
    
    for account in test_accounts:
        try:
            response = requests.post(
                f"{API_BASE}/auth/login",
                json={"email": account["email"], "password": account["password"]},
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("user", {}).get("role") == account["role"]:
                    print(f"✅ Authentification {account['role']} OK")
                    success_count += 1
                else:
                    print(f"❌ Rôle incorrect pour {account['email']}")
            else:
                print(f"❌ Authentification échouée pour {account['email']}: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Erreur auth {account['email']}: {e}")
    
    return success_count == len(test_accounts)

def test_api_endpoints():
    """Test les endpoints principaux de l'API"""
    # Login pour obtenir un token
    try:
        login_response = requests.post(
            f"{API_BASE}/auth/login",
            json={"email": "admin@secura.com", "password": "admin123"},
            timeout=5
        )
        
        if login_response.status_code != 200:
            print("❌ Impossible d'obtenir un token d'authentification")
            return False
            
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Test des endpoints
        endpoints = [
            ("/clients", "Clients"),
            ("/devis", "Devis"),
            ("/chantiers", "Chantiers"),
            ("/interventions", "Interventions"),
            ("/dashboard/stats", "Statistiques"),
            ("/services", "Services")
        ]
        
        success_count = 0
        
        for endpoint, name in endpoints:
            try:
                response = requests.get(f"{API_BASE}{endpoint}", headers=headers, timeout=5)
                if response.status_code == 200:
                    print(f"✅ Endpoint {name} OK")
                    success_count += 1
                else:
                    print(f"❌ Endpoint {name} erreur: {response.status_code}")
            except Exception as e:
                print(f"❌ Erreur endpoint {name}: {e}")
        
        return success_count == len(endpoints)
        
    except Exception as e:
        print(f"❌ Erreur test endpoints: {e}")
        return False

def main():
    """Fonction principale de test"""
    print("🧪 Test de l'ERP Secura Protect")
    print("=" * 50)
    
    tests = [
        ("Backend API", test_api_health),
        ("Frontend", test_frontend),
        ("Authentification", test_authentication),
        ("Endpoints API", test_api_endpoints)
    ]
    
    passed_tests = 0
    total_tests = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n🔍 Test: {test_name}")
        try:
            if test_func():
                passed_tests += 1
                print(f"✅ {test_name} : RÉUSSI")
            else:
                print(f"❌ {test_name} : ÉCHOUÉ")
        except Exception as e:
            print(f"❌ {test_name} : ERREUR - {e}")
    
    print("\n" + "=" * 50)
    print(f"📊 Résultats: {passed_tests}/{total_tests} tests réussis")
    
    if passed_tests == total_tests:
        print("🎉 Tous les tests sont réussis ! L'ERP fonctionne correctement.")
        print("\n🌐 URLs d'accès:")
        print(f"   Frontend: {FRONTEND_URL}")
        print(f"   API: {API_BASE}")
        print(f"   Documentation: http://localhost:8000/docs")
        return 0
    else:
        print("⚠️  Certains tests ont échoué. Vérifiez la configuration.")
        print("\n💡 Conseils de dépannage:")
        print("   1. Vérifiez que MongoDB est démarré")
        print("   2. Vérifiez que les serveurs backend et frontend sont lancés")
        print("   3. Exécutez ./start_erp.sh pour démarrer automatiquement")
        return 1

if __name__ == "__main__":
    sys.exit(main())