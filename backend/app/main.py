# backend/app/main.py
from fastapi import FastAPI, Depends, Query, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import text  # <--- IMPORTANT: ajout de text
from .database import SessionLocal, engine
from . import models, auth
import json
from datetime import datetime
from fastapi import Request
# Création des tables (si elles n'existent pas)
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="NYC WebSIG API")

# CORS
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

# --- Utilitaires ---
def get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "0.0.0.0"

def log_action(db: Session, user_id: int, username: str, action: str, details: str = None, ip: str = None):
    log = models.AuditLog(
        user_id=user_id,
        username=username,
        action=action,
        details=details,
        ip_address=ip
    )
    db.add(log)
    db.commit()

# ===============================================
# AUTHENTIFICATION
# ===============================================
@app.post("/token")
async def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Identifiants incorrects")
    access_token = auth.create_access_token(data={"sub": user.username, "role": user.role})
    # Correction ici : on passe 'request' (instance) et non 'Request' (classe)
    log_action(db, user.id, user.username, "login", f"Connexion réussie depuis IP {get_client_ip(request)}")
    return {"access_token": access_token, "token_type": "bearer", "role": user.role}

# Inscription publique (création d'un compte standard)
@app.post("/api/register")
async def register(username: str, password: str, email: str = None, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.username == username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Nom d'utilisateur déjà pris")
    hashed = auth.get_password_hash(password)
    new_user = models.User(username=username, hashed_password=hashed, email=email, role='user')  # par défaut user
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    log_action(db, new_user.id, new_user.username, "register", "Nouvel utilisateur inscrit")
    return {"message": "Utilisateur créé avec succès", "username": new_user.username}

# (Admin) Liste de tous les utilisateurs
@app.get("/api/admin/users")
def get_users(db: Session = Depends(get_db), current_admin: models.User = Depends(auth.get_current_admin)):
    users = db.query(models.User).all()
    return [{"id": u.id, "username": u.username, "email": u.email, "role": u.role, "is_active": u.is_active} for u in users]

# (Admin) Changer le rôle d'un utilisateur
@app.put("/api/admin/users/{user_id}/role")
def change_user_role(user_id: int, new_role: str, db: Session = Depends(get_db), current_admin: models.User = Depends(auth.get_current_admin)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    if new_role not in ['admin', 'user']:
        raise HTTPException(status_code=400, detail="Rôle invalide")
    user.role = new_role
    db.commit()
    log_action(db, current_admin.id, current_admin.username, "change_role", f"Rôle de {user.username} changé en {new_role}")
    return {"message": "Rôle mis à jour"}

# (Admin) Récupérer les logs (historique des actions)
@app.get("/api/admin/logs")
def get_logs(limit: int = 100, db: Session = Depends(get_db), current_admin: models.User = Depends(auth.get_current_admin)):
    logs = db.query(models.AuditLog).order_by(models.AuditLog.timestamp.desc()).limit(limit).all()
    return [
        {
            "id": log.id,
            "username": log.username,
            "action": log.action,
            "details": log.details,
            "ip_address": log.ip_address,
            "timestamp": log.timestamp.isoformat()
        }
        for log in logs
    ]

# ===============================================
# 1. QUARTIERS (GeoJSON) - corrigé avec text()
# ===============================================
@app.get("/api/neighborhoods/geojson")
def get_neighborhoods_geojson(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    query = text("""
        SELECT gid, boroname, ST_AsGeoJSON(ST_Transform(geom, 4326)) as geojson
        FROM nyc_neighborhoods
    """)
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
# 2. RECHERCHE AVEC FILTRE BOROUGH - corrigé
# ===============================================
@app.get("/api/neighborhoods/search")
def search_neighborhoods(
    q: str = Query("", description="Texte de recherche"),
    borough: str = Query(None, description="Filtrer par arrondissement"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    sql = text("""
        SELECT gid, boroname, ST_AsGeoJSON(ST_Transform(geom, 4326)) as geojson
        FROM nyc_neighborhoods
        WHERE 1=1
        AND (:q = '' OR boroname ILIKE :q)
        AND (:borough IS NULL OR boroname = :borough)
    """)
    params = {"q": q or "", "borough": borough}
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
# 3. STATISTIQUES (population par borough) - corrigé
# ===============================================
@app.get("/api/statistics/population-by-borough")
def get_population_by_borough(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    query = text("""
        SELECT boroname, SUM(popn_total) as total_population
        FROM nyc_census_blocks
        WHERE popn_total IS NOT NULL
        GROUP BY boroname
        ORDER BY total_population DESC
    """)
    result = db.execute(query).fetchall()
    return [
        {"borough": row.boroname, "population": row.total_population}
        for row in result
    ]

# ===============================================
# 4. RECHERCHE SPATIALE - corrigé
# ===============================================
@app.get("/api/spatial/within-radius")
def find_within_radius(
    lat: float = Query(...),
    lon: float = Query(...),
    radius: float = Query(500),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    query = text("""
        SELECT gid, boroname, popn_total,
               ST_AsGeoJSON(ST_Transform(geom, 4326)) as geojson
        FROM nyc_census_blocks
        WHERE ST_DWithin(
            geom,
            ST_Transform(ST_SetSRID(ST_MakePoint(:lon, :lat), 4326), 26918),
            :radius
        )
        LIMIT 100
    """)
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
# 5. METROS - corrigé
# ===============================================
@app.get("/api/subways/geojson")
def get_subways_geojson(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    query = text("""
        SELECT gid, name, ST_AsGeoJSON(ST_Transform(geom, 4326)) as geojson
        FROM nyc_subway_stations
    """)
    result = db.execute(query).fetchall()
    features = []
    for row in result:
        features.append({
            "type": "Feature",
            "geometry": json.loads(row.geojson),
            "properties": {"gid": row.gid, "name": row.name}
        })
    return {"type": "FeatureCollection", "features": features}


# ================== STREETS (nyc_streets) ==================
@app.get("/api/streets/geojson")
def get_streets_geojson(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    query = text("""
        SELECT gid, name, ST_AsGeoJSON(ST_Transform(geom, 4326)) as geojson
        FROM nyc_streets
        LIMIT 400
    """)
    result = db.execute(query).fetchall()
    features = []
    for row in result:
        features.append({
            "type": "Feature",
            "geometry": json.loads(row.geojson),
            "properties": {"gid": row.gid, "name": row.name}
        })
    return {"type": "FeatureCollection", "features": features}

# ================== CENSUS BLOCKS ==================
@app.get("/api/census/geojson")
def get_census_geojson(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    query = text("""
        SELECT gid, boroname, popn_total, ST_AsGeoJSON(ST_Transform(geom, 4326)) as geojson
        FROM nyc_census_blocks
        WHERE popn_total IS NOT NULL
        LIMIT 500
    """)
    result = db.execute(query).fetchall()
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

# ================== RUE (table 'rue') ==================
@app.get("/api/rue/geojson")
def get_rue_geojson(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    query = text("""
        SELECT gid, name, ST_AsGeoJSON(ST_Transform(geom, 4326)) as geojson
        FROM rue LIMIT 500
    """)
    result = db.execute(query).fetchall()
    features = []
    for row in result:
        features.append({
            "type": "Feature",
            "geometry": json.loads(row.geojson),
            "properties": {"gid": row.gid, "name": row.name}
        })
    return {"type": "FeatureCollection", "features": features}

# ===============================================
# Endpoint de test (sans authentification pour vérifier)
# ===============================================
@app.get("/api/test-db")
def test_db(db: Session = Depends(get_db)):
    count = db.query(models.Neighborhoods).count()
    return {"status": "Connexion réussie !", "nombre_de_quartiers": count}

def log_action(db: Session, user_id: int, username: str, action: str, details: str = None, ip: str = None):
    log = models.AuditLog(
        user_id=user_id,
        username=username,
        action=action,
        details=details,
        ip_address=ip
    )
    db.add(log)
    db.commit()

@app.get("/api/admin/logs")
def get_logs(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Vérifier que l'utilisateur est admin
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Accès refusé")
    
    logs = db.query(models.Log).order_by(models.Log.timestamp.desc()).limit(100).all()
    return logs

@app.post("/api/log")
async def create_log(
    action: str,
    details: str = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    log = models.Log(
        user_id=current_user.id,
        action=action,
        details=details,
        timestamp=datetime.utcnow()
    )
    db.add(log)
    db.commit()
    return {"message": "Log enregistré"}

