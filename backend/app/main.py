# backend/app/main.py
from fastapi import FastAPI, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text  # 👈 Crucial pour exécuter du SQL brut en SQLAlchemy 2.0
from .database import SessionLocal, engine
from . import models
import json

# Création des tables si elles n'existent pas (optionnel, mais sécurisant)
# models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="NYC WebSIG API")

# --- Configuration CORS pour autoriser Vite (React) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Le port de votre frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Dépendance pour avoir la session BDD ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ===============================================
# 1. ENDPOINT : Récupérer les quartiers en GeoJSON
# ===============================================
@app.get("/api/neighborhoods/geojson")
def get_neighborhoods_geojson(db: Session = Depends(get_db)):
    # On transforme la géométrie de 26918 vers 4326 (pour Leaflet)
    query = """
        SELECT gid, boroname, ST_AsGeoJSON(ST_Transform(geom, 4326)) as geojson
        FROM nyc_neighborhoods
    """
    # Correction : Emballage de la requête brute dans text()
    result = db.execute(text(query)).fetchall()
    
    features = []
    for row in result:
        features.append({
            "type": "Feature",
            "geometry": json.loads(row.geojson),  # Convertir le texte JSON en objet
            "properties": {
                "gid": row.gid,
                "name": row.boroname  # Le nom du quartier
            }
        })
    
    return {"type": "FeatureCollection", "features": features}

# ===============================================
# 2. REQUETE ATTRIBUTAIRE : Recherche par nom
# ===============================================
@app.get("/api/neighborhoods/search")
def search_neighborhoods(q: str = Query(..., min_length=1), db: Session = Depends(get_db)):
    # Recherche insensible à la casse avec ILIKE
    query = """
        SELECT gid, boroname, ST_AsGeoJSON(ST_Transform(geom, 4326)) as geojson
        FROM nyc_neighborhoods
        WHERE boroname ILIKE :name
    """
    # Correction : Emballage dans text()
    result = db.execute(text(query), {"name": f"%{q}%"}).fetchall()
    
    features = []
    for row in result:
        features.append({
            "type": "Feature",
            "geometry": json.loads(row.geojson),
            "properties": {"gid": row.gid, "name": row.boroname}
        })
    return {"type": "FeatureCollection", "features": features}

# ===============================================
# 3. REQUETE SPATIALE : Rayon autour d'un point GPS
#    (Trouve les blocs de recensement dans un rayon)
# ===============================================
@app.get("/api/spatial/within-radius")
def find_within_radius(
    lat: float = Query(..., description="Latitude (ex: 40.7128)"),
    lon: float = Query(..., description="Longitude (ex: -74.0060)"),
    radius: float = Query(500, description="Rayon en mètres"),
    db: Session = Depends(get_db)
):
    # On utilise ST_DWithin avec la géographie (pour une distance en mètres)
    # On transforme le point GPS (4326) vers le système de la colonne (26918)
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
    # Correction : Emballage dans text()
    result = db.execute(text(query), {"lat": lat, "lon": lon, "radius": radius}).fetchall()
    
    features = []
    for row in result:
        features.append({
            "type": "Feature",
            "geometry": json.loads(row.geojson),
            "properties": {
                "gid": row.gid,
                "boroname": row.boroname,
                "population": row.popn_total
            }
        })
    return {"type": "FeatureCollection", "features": features}

# ===============================================
# 4. ENDPOINT : Récupérer les stations de métro
# ===============================================
@app.get("/api/subways/geojson")
def get_subways_geojson(db: Session = Depends(get_db)):
    query = """
        SELECT gid, name, ST_AsGeoJSON(ST_Transform(geom, 4326)) as geojson
        FROM nyc_subway_stations
    """
    # Correction : Emballage dans text()
    result = db.execute(text(query)).fetchall()
    
    features = []
    for row in result:
        features.append({
            "type": "Feature",
            "geometry": json.loads(row.geojson),
            "properties": {"gid": row.gid, "name": row.name}
        })
    return {"type": "FeatureCollection", "features": features}

# --- Endpoint de test (pour vérifier que tout tourne) ---
@app.get("/api/test-db")
def test_db(db: Session = Depends(get_db)):
    count = db.query(models.Neighborhoods).count()
    return {"status": "Connexion réussie !", "nombre_de_quartiers": count}