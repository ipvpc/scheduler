import psycopg2
import psycopg2.extras
import psycopg2.pool
import os
from dotenv import load_dotenv
from contextlib import contextmanager

# Load environment variables - try local.env first, then .env
if os.path.exists('local.env'):
    load_dotenv('local.env')
    print("Loaded local.env file")
elif os.path.exists('.env'):
    load_dotenv('.env')
    print("Loaded .env file")
else:
    print("No environment file found, using system environment variables")

# Database configuration with fallback (no credentials in source — set DATABASE_URL)
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    DATABASE_URL = "postgresql://markets:changeme@localhost:5432/markets_prod"
    print(
        "Warning: DATABASE_URL not set; using local dev default "
        "(postgresql://markets:***@localhost:5432/markets_prod). "
        "Set DATABASE_URL for your environment."
    )


def _redact_db_url(url: str) -> str:
    import urllib.parse

    parsed = urllib.parse.urlparse(url)
    user = parsed.username or ""
    host = parsed.hostname or ""
    port = f":{parsed.port}" if parsed.port else ""
    path = parsed.path or ""
    return f"{parsed.scheme}://{user}:***@{host}{port}{path}"


print(f"Using DATABASE_URL: {_redact_db_url(DATABASE_URL)}")

# Parse database URL
def parse_database_url(url):
    """Parse database URL into connection parameters"""
    import urllib.parse
    parsed = urllib.parse.urlparse(url)
    return {
        'host': parsed.hostname,
        'port': parsed.port or 5432,
        'database': parsed.path[1:],  # Remove leading slash
        'user': parsed.username,
        'password': parsed.password
    }

# Get connection parameters
db_params = parse_database_url(DATABASE_URL)

# Create connection pool
connection_pool = psycopg2.pool.ThreadedConnectionPool(
    minconn=1,
    maxconn=20,
    host=db_params['host'],
    port=db_params['port'],
    database=db_params['database'],
    user=db_params['user'],
    password=db_params['password'],
    application_name="scheduler-api"
)

@contextmanager
def get_db():
    """Context manager to get database connection"""
    conn = None
    try:
        conn = connection_pool.getconn()
        yield conn
    finally:
        if conn:
            connection_pool.putconn(conn)

def test_database_connection():
    """Test database connection with retry logic"""
    import time
    
    max_retries = 3
    retry_delay = 5
    
    for attempt in range(max_retries):
        try:
            print(f"Database connection attempt {attempt + 1}/{max_retries}")
            with get_db() as conn:
                with conn.cursor() as cursor:
                    cursor.execute("SELECT 1 as test")
                    result = cursor.fetchone()
                    if result:
                        print("✅ Database connection successful!")
                        return True
        except psycopg2.Error as e:
            print(f"❌ Database connection failed (attempt {attempt + 1}): {e}")
            if attempt < max_retries - 1:
                print(f"⏳ Retrying in {retry_delay} seconds...")
                time.sleep(retry_delay)
            else:
                print("❌ All database connection attempts failed")
                return False
        except Exception as e:
            print(f"❌ Unexpected error: {e}")
            return False
    
    return False
