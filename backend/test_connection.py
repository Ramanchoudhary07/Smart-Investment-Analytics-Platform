import os
from dotenv import load_dotenv
import psycopg2

load_dotenv()

try:
    # Try to connect
    conn = psycopg2.connect(
        host="localhost",
        port=5432,
        user="postgres",
        password="Raman.9211",  # Replace with your password
        database="postgres"  # Connect to default postgres database first
    )
    print("✅ PostgreSQL connection successful!")
    
    # Check if smart_portfolio database exists
    cursor = conn.cursor()
    cursor.execute("SELECT datname FROM pg_database WHERE datname='smart_portfolio';")
    result = cursor.fetchone()
    
    if result:
        print("✅ smart_portfolio database exists")
    else:
        print("❌ smart_portfolio database does not exist")
        print("Creating smart_portfolio database...")
        cursor.execute("CREATE DATABASE smart_portfolio;")
        print("✅ smart_portfolio database created!")
    
    conn.close()
    
except Exception as e:
    print("❌ Database connection failed:")
    print(e)
