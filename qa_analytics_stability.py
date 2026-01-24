import sys
import os
from sqlalchemy.orm import Session

# Add backend to path
sys.path.append(os.getcwd())

from backend.database import SessionLocal
from backend.routes.admin_routes import get_dashboard_stats, get_department_stats

def test_analytics_logic():
    print("🚀 Starting Backend Analytics Logic Test...")
    db = SessionLocal()
    try:
        # 1. Test Dashboard Stats
        print("Testing get_dashboard_stats()...")
        stats = get_dashboard_stats(db)
        print("✅ Stats calculated successfully:")
        print(f"   - Total: {stats['total']}")
        print(f"   - Resolution Rate: {stats['resolution_rate']}%")
        print(f"   - Avg Time: {stats['avg_resolution_time']}h")
        
        # 2. Test Department Stats
        print("\nTesting get_department_stats()...")
        dept_stats = get_department_stats(db)
        print(f"✅ Department stats calculated for {len(dept_stats)} departments.")
        if dept_stats:
            print(f"   - Sample: {dept_stats[0]['dept']} ({dept_stats[0]['pending']} pending)")

    except Exception as e:
        print(f"❌ CRITICAL FAILURE: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test_analytics_logic()
