# backend/app/models.py
from sqlalchemy import Column, Integer, String, Float, BigInteger
from geoalchemy2 import Geometry
from .database import Base

# 1. Census Blocks (avec la population)
class Blocks(Base):
    __tablename__ = "nyc_census_blocks"
    gid = Column(Integer, primary_key=True, index=True)
    boroname = Column(String)       # Arrondissement
    popn_total = Column(Integer)    # Population totale
    geom = Column(Geometry('MULTIPOLYGON', srid=26918))

# 2. Rues (Streets)
class Street(Base):
    __tablename__ = "nyc_streets"
    gid = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    geom = Column(Geometry('MULTILINESTRING', srid=26918))

# 3. Quartiers (Neighborhoods)
class Neighborhoods(Base):
    __tablename__ = "nyc_neighborhoods"
    gid = Column(Integer, primary_key=True, index=True)
    # ⚠️ Je mets String car un nom de quartier n'est pas un nombre
    boroname = Column(String)  
    # Si votre colonne s'appelle 'name' au lieu de 'boroname', changez le nom ici.
    geom = Column(Geometry('MULTIPOLYGON', srid=26918))

# 4. Stations de métro (Subway)
class Metro(Base):
    __tablename__ = "nyc_subway_stations"
    gid = Column(Integer, primary_key=True, index=True)
    id = Column(Integer)
    name = Column(String)
    geom = Column(Geometry('MULTIPOINT', srid=26918))

# 5. Rue (votre table 'rue')
class Rue(Base):
    __tablename__ = "rue"
    gid = Column(Integer, primary_key=True, index=True)
    id = Column(Integer)
    name = Column(String)
    geom = Column(Geometry('MULTILINESTRING', srid=26918))

# À ajouter dans models.py
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    email = Column(String, unique=True, index=True, nullable=True)
    is_active = Column(Integer, default=1)