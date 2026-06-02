import sys
import os

# Add project root to path
sys.path.append(os.path.abspath('.'))

try:
    from backend.main import app
    print("Success: Imported 'app' from 'backend.main'")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
