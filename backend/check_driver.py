import sys
import traceback

print(f"Python version: {sys.version}")

print("\n--- Attempting to import psycopg (v3) ---")
try:
    import psycopg
    print(f"SUCCESS: psycopg version: {psycopg.__version__}")
except ImportError:
    print("FAILURE: Could not import psycopg")
    traceback.print_exc()
except Exception:
    print("ERROR: Unexpected error importing psycopg")
    traceback.print_exc()

print("\n--- Attempting to import psycopg2 (v2) ---")
try:
    import psycopg2
    print(f"SUCCESS: psycopg2 version: {psycopg2.__version__}")
except ImportError:
    print("FAILURE: Could not import psycopg2")
    traceback.print_exc()
except Exception:
    print("ERROR: Unexpected error importing psycopg2")
    traceback.print_exc()
