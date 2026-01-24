import sqlite3
from backend.config import settings

DB_PATH = settings.DATABASE_URL.replace("sqlite:///", "")

def migrate():
    print(f"Migrating database at: {DB_PATH}")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Check if columns exist
        cursor.execute("PRAGMA table_info(complaints)")
        columns = [info[1] for info in cursor.fetchall()]
        
        if "ai_trust_score" not in columns:
            print("Adding ai_trust_score column...")
            cursor.execute("ALTER TABLE complaints ADD COLUMN ai_trust_score FLOAT DEFAULT 1.0")
        else:
            print("ai_trust_score already exists.")
            
        if "ai_trust_flags" not in columns:
            print("Adding ai_trust_flags column...")
            cursor.execute("ALTER TABLE complaints ADD COLUMN ai_trust_flags TEXT")
        else:
            print("ai_trust_flags already exists.")
            
        conn.commit()
        print("✅ Migration successful: AI Trust columns added.")
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
