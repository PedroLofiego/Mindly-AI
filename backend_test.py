#!/usr/bin/env python3
import requests
import sys
import json
from datetime import datetime

class RevisaHubAPITester:
    def __init__(self, base_url="https://ia-tutor-vark.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.profile_id = None
        self.session_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, timeout=30):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"  URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=timeout)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=timeout)

            print(f"  Status: {response.status_code}")
            if response.status_code != expected_status:
                print(f"  Response: {response.text[:500]}...")
            
            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")

            return success, response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text

        except requests.exceptions.RequestException as e:
            print(f"❌ Failed - Network Error: {str(e)}")
            return False, {}
        except json.JSONDecodeError as e:
            print(f"❌ Failed - JSON Error: {str(e)}")
            return False, response.text if 'response' in locals() else ""
        except Exception as e:
            print(f"❌ Failed - Unexpected Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test the root API endpoint"""
        success, response = self.run_test(
            "Root API Endpoint",
            "GET",
            "api/",
            200
        )
        if success and isinstance(response, dict):
            print(f"  Message: {response.get('message', 'No message')}")
        return success

    def test_create_profile(self):
        """Test profile creation with RevisaHub onboarding structure"""
        test_profile = {
            "name": "Test User",
            # Block A - Como você aprende melhor
            "canal_sensorial": "visual",
            "formato_explicacao": "analogias_historias", 
            "abordagem": "pratica",
            # Block B - Seu jeito de estudar
            "interacao_social": "sozinho",
            "estrutura_estudo": "equilibrado",
            "duracao_sessao": "30_60",
            "ambiente_estudo": "silencio",
            # Block C - Motivação
            "motivador_principal": "desafios_metas",
            "estrategia_dificuldade": "busca_exemplos",
            "planejamento_estudos": "as_vezes",
            # Block E - Personalização
            "interesse_cultural": "Naruto e animes"
        }
        
        success, response = self.run_test(
            "Create Profile",
            "POST", 
            "api/profiles",
            200,
            data=test_profile
        )
        
        if success and isinstance(response, dict):
            self.profile_id = response.get('id')
            print(f"  Created Profile ID: {self.profile_id}")
            # Verify profile has expected fields
            expected_fields = ['id', 'name', 'canal_sensorial', 'interesse_cultural']
            for field in expected_fields:
                if field not in response:
                    print(f"  ⚠️ Missing field: {field}")
        
        return success

    def test_get_profile(self):
        """Test retrieving profile"""
        if not self.profile_id:
            print("❌ Skipping - No profile ID available")
            return False
            
        success, response = self.run_test(
            "Get Profile",
            "GET",
            f"api/profiles/{self.profile_id}",
            200
        )
        
        if success and isinstance(response, dict):
            print(f"  Profile Name: {response.get('name', 'Unknown')}")
            print(f"  Canal Sensorial: {response.get('canal_sensorial', 'Unknown')}")
            print(f"  Interesse Cultural: {response.get('interesse_cultural', 'Unknown')}")
        
        return success

    def test_chat_message(self):
        """Test sending a chat message"""
        if not self.profile_id:
            print("❌ Skipping - No profile ID available")
            return False
            
        # Generate a session ID
        self.session_id = f"test-session-{int(datetime.now().timestamp())}"
        
        chat_request = {
            "session_id": self.session_id,
            "profile_id": self.profile_id,
            "message": "Explique o que é fotossíntese",
            "subject": "Biologia",
            "image_base64": None
        }
        
        success, response = self.run_test(
            "Chat Message",
            "POST",
            "api/chat",
            200,
            data=chat_request,
            timeout=60  # AI responses can take longer
        )
        
        if success and isinstance(response, dict):
            ai_response = response.get('response', '')
            print(f"  AI Response Length: {len(ai_response)} chars")
            print(f"  Response Preview: {ai_response[:100]}...")
            print(f"  Message ID: {response.get('message_id', 'Unknown')}")
            
            # Check if response contains expected elements for VARK/cultural adaptation
            if any(word in ai_response.lower() for word in ['visual', 'ver', 'imagem', 'diagrama']):
                print("  ✅ Contains visual learning elements")
            if any(word in ai_response.lower() for word in ['naruto', 'anime']):
                print("  ✅ Contains cultural references")
        
        return success

    def test_get_sessions(self):
        """Test retrieving sessions"""
        if not self.profile_id:
            print("❌ Skipping - No profile ID available")
            return False
            
        success, response = self.run_test(
            "Get Sessions",
            "GET",
            f"api/sessions/{self.profile_id}",
            200
        )
        
        if success and isinstance(response, list):
            print(f"  Sessions Count: {len(response)}")
            if response:
                session = response[0]
                print(f"  First Session ID: {session.get('id', 'Unknown')}")
                print(f"  Subject: {session.get('subject', 'Unknown')}")
        
        return success

    def test_get_progress(self):
        """Test getting progress stats"""
        if not self.profile_id:
            print("❌ Skipping - No profile ID available")
            return False
            
        success, response = self.run_test(
            "Get Progress Stats",
            "GET",
            f"api/progress/{self.profile_id}",
            200
        )
        
        if success and isinstance(response, dict):
            print(f"  Total Sessions: {response.get('total_sessions', 0)}")
            print(f"  Total Messages: {response.get('total_messages', 0)}")
            print(f"  Subjects Studied: {response.get('subjects_studied', [])}")
            print(f"  Favorite Subject: {response.get('favorite_subject', 'None')}")
        
        return success

    def run_all_tests(self):
        """Run all backend API tests"""
        print("🚀 Starting MINDLY API Tests...")
        print(f"Base URL: {self.base_url}")
        print("=" * 60)

        # Test sequence
        tests = [
            self.test_root_endpoint,
            self.test_create_profile,
            self.test_get_profile,
            self.test_chat_message,
            self.test_get_sessions,
            self.test_get_progress
        ]

        for test in tests:
            test()

        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        success_rate = (self.tests_passed / self.tests_run) * 100 if self.tests_run > 0 else 0
        print(f"Success Rate: {success_rate:.1f}%")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return True
        else:
            print("⚠️ Some tests failed")
            return False

def main():
    tester = MindlyAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())