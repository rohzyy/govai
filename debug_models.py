import sys
import os
sys.path.append(os.getcwd())
try:
    from backend.models import Base
    print("✅ Successfully imported Base")
    from backend.models import TrustedContact
    print("✅ Successfully imported TrustedContact")
except Exception as e:
    import traceback
    traceback.print_exc()
