# backend/app/main.py
from fastapi import FastAPI, Depends, Query, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from .database import SessionLocal, engine
from . import models, auth
from sqlalchemy import func
import json

# Création des tables (si elles n'existent pas)
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="NYC WebSIG API")

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ===============================================
# AUTHENTIFICATION
# ===============================================
@app.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Identifiants incorrects")
    
    access_token = auth.create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/register")
async def register(username: str, password: str, email: str = None, db: Session = Depends(get_db)):
    # Vérifier si l'utilisateur existe déjà
    existing_user = db.query(models.User).filter(models.User.username == username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Nom d'utilisateur déjà pris")
    
    hashed = auth.get_password_hash(password)
    new_user = models.User(username=username, hashed_password=hashed, email=email)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "Utilisateur créé avec succès", "username": new_user.username}

# ===============================================
# 1. QUARTIERS (protégé)
# ===============================================
@app.get("/api/neighborhoods/geojson")
def get_neighborhoods_geojson(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)  # 🔒 Protection
):
    query = """
        SELECT gid, boroname, ST_AsGeoJSON(ST_Transform(geom, 4326)) as geojson
        FROM nyc_neighborhoods
    """
    result = db.execute(query).fetchall()
    features = []
    for row in result:
        features.append({
            "type": "Feature",
            "geometry": json.loads(row.geojson),
            "properties": {"gid": row.gid, "name": row.boroname}
        })
    return {"type": "FeatureCollection", "features": features}

# ===============================================
# 2. RECHERCHE AVEC FILTRE PAR BOROUGH (ajout du paramètre)
# ===============================================
@app.get("/api/neighborhoods/search")
def search_neighborhoods(
    q: str = Query("", min_length=0),
    borough: str = Query(None, description="Filtrer par arrondissement (Manhattan, Brooklyn, etc.)"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)  # 🔒 Protection
):
    sql = """
        SELECT gid, boroname, ST_AsGeoJSON(ST_Transform(geom, 4326)) as geojson
        FROM nyc_neighborhoods
        WHERE 1=1
    """
    params = {}
    
    if q:
        sql += " AND boroname ILIKE :q"
        params["q"] = f"%{q}%"
    if borough:
        sql += " AND boroname = :borough"
        params["borough"] = borough
    
    result = db.execute(sql, params).fetchall()
    features = []
    for row in result:
        features.append({
            "type": "Feature",
            "geometry": json.loads(row.geojson),
            "properties": {"gid": row.gid, "name": row.boroname}
        })
    return {"type": "FeatureCollection", "features": features}

# ===============================================
# 3. STATISTIQUES POUR LE GRAPHIQUE (Population par Borough)
# ===============================================
@app.get("/api/statistics/population-by-borough")
def get_population_by_borough(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)  # 🔒 Protection
):
    # On agrège la population des blocs de recensement par arrondissement
    query = """
        SELECT 
            boroname, 
            SUM(popn_total) as total_population
        FROM nyc_census_blocks
        WHERE popn_total IS NOT NULL
        GROUP BY boroname
        ORDER BY total_population DESC
    """
    result = db.execute(query).fetchall()
    return [
        {"borough": row.boroname, "population": row.total_population}
        for row in result
    ]

# ===============================================
# 4. RECHERCHE SPATIALE (protégée)
# ===============================================
@app.get("/api/spatial/within-radius")
def find_within_radius(
    lat: float = Query(...),
    lon: float = Query(...),
    radius: float = Query(500),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)  # 🔒 Protection
):
    query = """
        SELECT gid, boroname, popn_total, 
               ST_AsGeoJSON(ST_Transform(geom, 4326)) as geojson
        FROM nyc_census_blocks
        WHERE ST_DWithin(
            geom, 
            ST_Transform(ST_SetSRID(ST_MakePoint(:lon, :lat), 4326), 26918),
            :radius
        )
        LIMIT 100
    """
    result = db.execute(query, {"lat": lat, "lon": lon, "radius": radius}).fetchall()
    features = []
    for row in result:
        features.append({
            "type": "Feature",
            "geometry": json.loads(row.geojson),
            "properties": {"gid": row.gid, "boroname": row.boroname, "population": row.popn_total}
        })
    return {"type": "FeatureCollection", "features": features}

# ===============================================
# 5. METROS (protégée)
# ===============================================
@app.get("/api/subways/geojson")
def get_subways_geojson(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)  # 🔒 Protection
):
    query = """
        SELECT gid, name, ST_AsGeoJSON(ST_Transform(geom, 4326)) as geojson
        FROM nyc_subway_stations
    """
    result = db.execute(query).fetchall()
    features = []
    for row in result:
        features.append({
            "type": "Feature",
            "geometry": json.loads(row.geojson),
            "properties": {"gid": row.gid, "name": row.name}
        })
    return {"type": "FeatureCollection", "features": features}