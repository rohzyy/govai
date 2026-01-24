import requests
import json
import jwt
import datetime

BASE_URL = "http://localhost:8000"
ADMIN_EMAIL = "admin@grievance.ai"
ADMIN_PASSWORD = "ADMIN"

# Colors for terminal output
GREEN = "\033[92m"
RED = "\033[91m"
RESET = "\033[0m"

class QAAudit:
    def __init__(self):
        self.session = requests.Session()
        self.token = None
        self.success_count = 0
        self.fail_count = 0

    def log(self, message, status="INFO"):
        if status == "PASS":
            print(f"{GREEN}[PASS] {message}{RESET}")
            self.success_count += 1
        elif status == "FAIL":
            print(f"{RED}[FAIL] {message}{RESET}")
            self.fail_count += 1
        else:
            print(f"[INFO] {message}")

    def login(self):
        self.log(f"Logging in as {ADMIN_EMAIL}...")
        try:
            payload = {"username": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
            response = self.session.post(f"{BASE_URL}/auth/admin/token", data=payload)
            if response.status_code == 200:
                self.token = response.json()["access_token"]
                self.session.headers.update({"Authorization": f"Bearer {self.token}"})
                self.log("Login Successful", "PASS")
                return True
            else:
                self.log(f"Login Failed: {response.text}", "FAIL")
                return False
        except Exception as e:
            self.log(f"Login Exception: {e}", "FAIL")
            return False

    def check_endpoint(self, method, endpoint, payload=None, expected_status=200, check_fn=None):
        url = f"{BASE_URL}{endpoint}"
        self.log(f"Testing {method} {endpoint}...")
        try:
            if method == "GET":
                response = self.session.get(url)
            elif method == "POST":
                response = self.session.post(url, json=payload)
            elif method == "PUT":
                response = self.session.put(url, json=payload)
            
            if response.status_code == expected_status:
                data = response.json()
                if check_fn:
                    if check_fn(data):
                        self.log(f"{endpoint} returned correct data", "PASS")
                    else:
                        self.log(f"{endpoint} returned unexpected data structure", "FAIL")
                else:
                    self.log(f"{endpoint} Status OK", "PASS")
            else:
                self.log(f"{endpoint} Failed. Status: {response.status_code}, Response: {response.text[:100]}", "FAIL")

        except Exception as e:
            self.log(f"{endpoint} Exception: {e}", "FAIL")

    def run_audit(self):
        if not self.login():
            return

        print("\n--- 1. DASHBOARD STATS ---")
        self.check_endpoint("GET", "/admin/stats", check_fn=lambda d: "total" in d and "pending" in d)

        print("\n--- 2. COMPLAINTS LIST ---")
        self.check_endpoint("GET", "/admin/complaints", check_fn=lambda d: isinstance(d, list))
        self.check_endpoint("GET", "/admin/complaints?filter=unassigned", check_fn=lambda d: isinstance(d, list))
        self.check_endpoint("GET", "/admin/complaints?filter=sla_breached", check_fn=lambda d: isinstance(d, list))

        print("\n--- 3. OFFICERS MANAGEMENT ---")
        self.check_endpoint("GET", "/admin/officers", check_fn=lambda d: isinstance(d, list))
        
        # Test creating an officer (Use random ID to avoid conflict)
        import random
        emp_id = f"TEST_OFF_{random.randint(1000, 9999)}"
        new_officer = {
            "employee_id": emp_id,
            "name": "QA Test Officer",
            "designation": "Junior Engineer",
            "department_id": 1,
            "ward": "Ward 1",
            "zone": "North",
            "circle": "Circle A",
            "status": "Active",
            "email": f"qa_{emp_id}@test.com",
            "phone": "9999999999"
        }
        self.check_endpoint("POST", "/admin/officers", payload=new_officer, expected_status=200)

        print("\n--- 4. ANALYTICS & LOGS ---")
        self.check_endpoint("GET", "/admin/analytics/trends", check_fn=lambda d: isinstance(d, list))
        self.check_endpoint("GET", "/admin/audit-logs", check_fn=lambda d: isinstance(d, list))
        self.check_endpoint("GET", "/admin/departments", check_fn=lambda d: isinstance(d, list))

        print(f"\nAUDIT COMPLETE. Success: {self.success_count}, Fails: {self.fail_count}")

if __name__ == "__main__":
    audit = QAAudit()
    audit.run_audit()
