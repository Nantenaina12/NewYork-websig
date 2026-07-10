# backend/app/database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# 1. Charge les variables du fichier .env
load_dotenv()

# 2. Récupère l'URL de connexion
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# 3. Crée le moteur (engine) qui parle à PostgreSQL
#    - pool_pre_ping permet de vérifier que la connexion est toujours active
engine = create_engine(SQLALCHEMY_DATABASE_URL, pool_pre_ping=True)

# 4. Crée une fabrique de sessions (pour exécuter des requêtes)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 5. La classe de base dont hériteront tous nos modèles (tables)
Base = declarative_base()