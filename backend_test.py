import requests
import sys
import json
from datetime import datetime

class SecuraProtectAPITester:
    def __init__(self, base_url="https://c653cee3-ac54-47e7-8620-575cbc6dc62b.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        if headers is None:
            headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                except:
                    print(f"   Response: {response.text[:200]}...")
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")

            return success, response.json() if response.text and response.status_code < 500 else {}

        except requests.exceptions.RequestException as e:
            print(f"❌ Failed - Network Error: {str(e)}")
            return False, {}
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test the root API endpoint"""
        return self.run_test(
            "Root API Endpoint",
            "GET",
            "",
            200
        )

    def test_get_services(self):
        """Test getting services list"""
        success, response = self.run_test(
            "Get Services",
            "GET", 
            "services",
            200
        )
        
        if success and 'services' in response:
            services = response['services']
            print(f"   Found {len(services)} services:")
            for service in services:
                print(f"   - {service.get('name', 'Unknown')}: {service.get('description', 'No description')[:50]}...")
            
            # Verify expected services are present
            expected_services = ["Sécurité Privée", "Vidéosurveillance", "Contrôle d'Accès", "Détection Intrusion"]
            found_services = [s.get('name') for s in services]
            
            for expected in expected_services:
                if expected in found_services:
                    print(f"   ✅ Found expected service: {expected}")
                else:
                    print(f"   ❌ Missing expected service: {expected}")
                    
        return success, response

    def test_create_contact_inquiry(self):
        """Test creating a contact inquiry"""
        test_data = {
            "first_name": "Jean",
            "last_name": "Dupont", 
            "email": "jean.dupont@test.com",
            "phone": "+33123456789",
            "service_type": "Sécurité Privée",
            "message": "Je souhaite obtenir un devis pour la sécurité de mon entreprise."
        }
        
        success, response = self.run_test(
            "Create Contact Inquiry",
            "POST",
            "contact",
            200,
            data=test_data
        )
        
        if success and 'id' in response:
            print(f"   ✅ Contact inquiry created with ID: {response['id']}")
            return success, response
        
        return success, response

    def test_get_contact_inquiries(self):
        """Test getting all contact inquiries"""
        success, response = self.run_test(
            "Get Contact Inquiries",
            "GET",
            "contact", 
            200
        )
        
        if success and isinstance(response, list):
            print(f"   Found {len(response)} contact inquiries")
            for inquiry in response[:3]:  # Show first 3
                print(f"   - {inquiry.get('first_name', '')} {inquiry.get('last_name', '')}: {inquiry.get('service_type', '')}")
                
        return success, response

    def test_create_status_check(self):
        """Test creating a status check"""
        test_data = {
            "client_name": "Test Client"
        }
        
        success, response = self.run_test(
            "Create Status Check",
            "POST",
            "status",
            200,
            data=test_data
        )
        
        return success, response

    def test_get_status_checks(self):
        """Test getting status checks"""
        success, response = self.run_test(
            "Get Status Checks",
            "GET",
            "status",
            200
        )
        
        if success and isinstance(response, list):
            print(f"   Found {len(response)} status checks")
            
        return success, response

    def test_invalid_contact_data(self):
        """Test contact form with invalid data"""
        invalid_data = {
            "first_name": "",  # Empty required field
            "last_name": "Test",
            "email": "invalid-email",  # Invalid email
            "phone": "123",
            "service_type": "Invalid Service",  # Invalid service type
            "message": ""  # Empty required field
        }
        
        success, response = self.run_test(
            "Invalid Contact Data (should fail)",
            "POST",
            "contact",
            422,  # Expecting validation error
            data=invalid_data
        )
        
        # For this test, success means we got the expected error
        return success, response

def main():
    print("🚀 Starting Secura Protect API Tests")
    print("=" * 50)
    
    tester = SecuraProtectAPITester()
    
    # Test all endpoints
    print("\n📋 Testing Core API Functionality...")
    
    # Basic connectivity
    tester.test_root_endpoint()
    
    # Services endpoint
    tester.test_get_services()
    
    # Contact functionality
    tester.test_create_contact_inquiry()
    tester.test_get_contact_inquiries()
    
    # Status functionality  
    tester.test_create_status_check()
    tester.test_get_status_checks()
    
    # Error handling
    tester.test_invalid_contact_data()
    
    # Print final results
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed! API is working correctly.")
        return 0
    else:
        print(f"⚠️  {tester.tests_run - tester.tests_passed} tests failed. Check the issues above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())