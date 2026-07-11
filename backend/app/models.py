from sqlalchemy import Column, Integer, String, Float, BigInteger, DateTime
from geoalchemy2 import Geometry
from .database import Base
from datetime import datetime

# 1. Census Blocks
class Blocks(Base):
    __tablename__ = "nyc_census_blocks"
    gid = Column(Integer, primary_key=True, index=True)
    boroname = Column(String)
    popn_total = Column(Integer)
    geom = Column(Geometry('MULTIPOLYGON', srid=26918))

# 2. Streets
class Street(Base):
    __tablename__ = "nyc_streets"
    gid = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    geom = Column(Geometry('MULTILINESTRING', srid=26918))

# 3. Neighborhoods
class Neighborhoods(Base):
    __tablename__ = "nyc_neighborhoods"
    gid = Column(Integer, primary_key=True, index=True)
    boroname = Column(String)
    geom = Column(Geometry('MULTIPOLYGON', srid=26918))

# 4. Subway stations
class Metro(Base):
    __tablename__ = "nyc_subway_stations"
    gid = Column(Integer, primary_key=True, index=True)
    id = Column(Integer)
    name = Column(String)
    geom = Column(Geometry('MULTIPOINT', srid=26918))

# 5. Rue (custom)
class Rue(Base):
    __tablename__ = "rue"
    gid = Column(Integer, primary_key=True, index=True)
    id = Column(Integer)
    name = Column(String)
    geom = Column(Geometry('MULTILINESTRING', srid=26918))

# 6. User (avec role)
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    email = Column(String, unique=True, index=True, nullable=True)
    is_active = Column(Integer, default=1)
    role = Column(String, default='user')   # 'admin' ou 'user'

# 7. AuditLog (historique)
class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=True)
    username = Column(String)
    action = Column(String)
    details = Column(String, nullable=True)
    ip_address = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)