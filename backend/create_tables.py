from models import Base, engine

# This command will create all tables defined in models.py
Base.metadata.create_all(bind=engine)
