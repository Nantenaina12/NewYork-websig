# backend/app/schemas.py
from pydantic import BaseModel

# Schéma de base pour un quartier (sans la géométrie, pour les listes)
class NeighborhoodsBase(BaseModel):
    id: int
    name: str

    class Config:
        orm_mode = True  # Permet de lire directement les objets SQLAlchemy


# Schéma spécifique pour le GeoJSON (que nous utiliserons pour la carte)
class Feature(BaseModel):
    type: str = "Feature"
    geometry: dict  # Ce sera le JSON de PostGIS
    properties: dict