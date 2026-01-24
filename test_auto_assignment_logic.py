import requests
import time
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# DB Connection (for verification and setup bypassing API restrictions if needed)
SQLALCHEMY_DATABASE_URL = "sqlite:///./grievance_enterprise_v3.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

BASE_URL = "http://127.0.0.1:8000"

def setup_test_data():
    db = SessionLocal()
    try:
        print("🔧 Setting up Test Data...")
        
        # 1. Ensure Department "Test Dept" exists
        dept = db.execute(text("SELECT * FROM departments WHERE name='Test Dept'")).fetchone()
        if not dept:
            db.execute(text("INSERT INTO departments (name, description, created_at) VALUES ('Test Dept', 'Testing Auto Assignment', CURRENT_TIMESTAMP)"))
            db.commit()
            dept_id = db.execute(text("SELECT id FROM departments WHERE name='Test Dept'")).fetchone()[0]
        else:
            dept_id = dept[0]
        print(f"   Department ID: {dept_id}")

        # 2. Ensure Officers exist
        # Officer A (Load 0)
        off_a = db.execute(text("SELECT * FROM officers WHERE employee_id='TEST_A'")).fetchone()
        if not off_a:
            db.execute(text(f"INSERT INTO officers (employee_id, name, designation, department_id, ward, status) VALUES ('TEST_A', 'Officer A', 'JE', {dept_id}, 'W1', 'Active')"))
            
        # Officer B (Load 10 - Artificially high)
        off_b = db.execute(text("SELECT * FROM officers WHERE employee_id='TEST_B'")).fetchone()
        if not off_b:
            db.execute(text(f"INSERT INTO officers (employee_id, name, designation, department_id, ward, status) VALUES ('TEST_B', 'Officer B', 'AE', {dept_id}, 'W1', 'Active')"))
            
        db.commit()
        
        # Get IDs
        off_a_id = db.execute(text("SELECT id FROM officers WHERE employee_id='TEST_A'")).fetchone()[0]
        off_b_id = db.execute(text("SELECT id FROM officers WHERE employee_id='TEST_B'")).fetchone()[0]
        print(f"   Officer A ID: {off_a_id}")
        print(f"   Officer B ID: {off_b_id}")
        
        # 3. Increase Load for Officer B manually
        # Create 5 dummy complaints assigned to B
        for i in range(5):
            db.execute(text(f"INSERT INTO complaints (title, description, status, assigned_officer_id, user_id, department_id) VALUES ('Dummy Load {i}', '...', 'IN_PROGRESS', {off_b_id}, 1, {dept_id})"))
        
        db.commit()
        print("✅ Test Data Setup Complete.")
        
        return dept_id, off_a_id, off_b_id
        
    except Exception as e:
        print(f"❌ Setup Failed: {e}")
        db.rollback()
        return None, None, None
    finally:
        db.close()

def test_flow(dept_id, expected_officer_id):
    print("\n🚀 Testing Auto-Assignment Flow...")
    
    # 1. Login as User (using Mock Google Login)
    # The backend supports MOCK_GOOGLE_TOKEN for development
    session = requests.Session()
    
    print("   Logging in with Mock Google Token...")
    res = session.post(f"{BASE_URL}/auth/google", json={"token": "MOCK_GOOGLE_TOKEN"})
    
    if res.status_code != 200:
        print(f"❌ Login Failed: {res.text}")
        return

    data = res.json()
    token = data.get("access_token")
    if not token:
         token = data.get("token") # The route returns "access_token" (cookies) and "token" (localstorage)
         
    # Need to extract the token string if it's not in access_token key cleanly (the route logic is a bit mixed in variable names)
    # Looking at auth_routes.py line 94: "access_token": refresh_token_str. Line 102: "token": actual_access_token.
    # We should use "token".
    token = data.get("token")
    
    print(f"✅ Login Successful. Token: {token[:10]}...")
    headers = {"Authorization": f"Bearer {token}"}
    
    # 2. Submit Complaint
    # ... (Rest is same)
    print("   (Switching strategy: Using 'Sanitation Department' via 'garbage' keyword)")
    
    # 2b. Ensure Sanitation Department Exists
    db = SessionLocal()
    sanitation = db.execute(text("SELECT * FROM departments WHERE name='Sanitation Department'")).fetchone()
    if not sanitation:
        print("   ⚠️ Sanitation Department missing. Creating...")
        db.execute(text("INSERT INTO departments (name, description, created_at) VALUES ('Sanitation Department', 'Auto-created for test', CURRENT_TIMESTAMP)"))
        db.commit()
        sanitation = db.execute(text("SELECT * FROM departments WHERE name='Sanitation Department'")).fetchone()
        
    dept_id = sanitation[0]
    print(f"   Using Sanitation Department ID: {dept_id}")
    
    # Create clean officer in Sanitation
    # Ensure unique employee ID to avoid constraint errors on re-run
    emp_id = f"CLEAN_OFF_{int(time.time())}"
    db.execute(text(f"INSERT INTO officers (employee_id, name, designation, department_id, status) VALUES ('{emp_id}', 'Clean Officer', 'JE', {dept_id}, 'Active')"))
    db.commit()
    clean_off_id = db.execute(text(f"SELECT id FROM officers WHERE employee_id='{emp_id}'")).fetchone()[0]
    print(f"   Created Clean Officer ID: {clean_off_id} in Sanitation (EmpID: {emp_id})")
    db.close()
    
    complaint_payload = {
        "title": "Huge pile of garbage",
        "description": "There is a lot of trash and waste here.",
        "location": "Test Loc",
        "priority": "High"
    }
    
    print("   Submitting complaint...")
    res = session.post(f"{BASE_URL}/complaints/", json=complaint_payload, headers=headers)
    
    if res.status_code != 200:
        print(f"❌ Complaint Submission Failed: {res.text}")
        return
        
    data = res.json()
    complaint_id = data["id"]
    print(f"✅ Complaint Submitted. ID: {complaint_id}")
    
    # 3. Verify Assignment
    # We check the DB directly for immediate result
    print("   Verifying assignment in DB...")
    db = SessionLocal()
    complaint = db.execute(text(f"SELECT assigned_officer_id, status FROM complaints WHERE id={complaint_id}")).fetchone()
    
    if complaint and complaint[0] == clean_off_id:
        print(f"✅ SUCCESS: Complaint auto-assigned to Officer {clean_off_id}")
        print(f"   Status: {complaint[1]}")
    else:
        print(f"❌ FAILURE: Assigned to {complaint[0]} (Expected {clean_off_id})")
        print(f"   Status: {complaint[1]}")

    db.close()

if __name__ == "__main__":
    test_flow(None, None)
