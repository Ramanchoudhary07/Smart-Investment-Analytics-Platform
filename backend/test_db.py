import os
from dotenv import load_dotenv
import psycopg2

load_dotenv()
url = os.getenv("DB_URL")
print("Connecting to:", url)

try:
    conn = psycopg2.connect(url)
    print("Database connection: SUCCESS")
    conn.close()
except Exception as e:
    print("Database connection: FAILED")
    print(e)
