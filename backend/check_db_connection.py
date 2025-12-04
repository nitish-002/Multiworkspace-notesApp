import psycopg
from psycopg import OperationalError

DB_NAME = 'ojt_db'
USER = 'postgres'
PASSWORD = '4747'
HOST = 'localhost'
PORT = '5432'

def check_and_create_db():
    try:
        # Connect to default 'postgres' db to check/create target db
        conn = psycopg.connect(
            dbname='postgres',
            user=USER,
            password=PASSWORD,
            host=HOST,
            port=PORT,
            autocommit=True
        )
        print(f"SUCCESS: Connected to PostgreSQL.")
        
        cur = conn.cursor()
        cur.execute("SELECT 1 FROM pg_database WHERE datname = %s", (DB_NAME,))
        exists = cur.fetchone()
        
        if not exists:
            print(f"Database '{DB_NAME}' does not exist. Creating...")
            cur.execute(f"CREATE DATABASE {DB_NAME}")
            print(f"Database '{DB_NAME}' created successfully.")
        else:
            print(f"Database '{DB_NAME}' already exists.")
            
        cur.close()
        conn.close()
        return True
    except OperationalError as e:
        print(f"CONNECTION FAILED: {e}")
        return False
    except Exception as e:
        print(f"ERROR: {e}")
        return False

if __name__ == "__main__":
    check_and_create_db()
