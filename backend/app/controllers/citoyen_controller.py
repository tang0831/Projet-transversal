from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.db.connection import get_db_connection
from app.structures.trie import Trie

router = APIRouter()

class CitoyenSchema(BaseModel):
    numero_cin: str
    nom: str
    prenom: str
    date_naissance: str
    lieu_naissance: str
    sexe: str
    profession: Optional[str] = None
    domicile: Optional[str] = None
    id_localite: int = 1

# Initialisation du Trie avec les noms existants
def charger_trie():
    trie = Trie()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT nom FROM citoyen")
    for (nom,) in cursor.fetchall():
        trie.inserer(nom)
    cursor.close()
    conn.close()
    return trie

@router.post("/citoyens/")
def upsert_citoyen(citoyen: CitoyenSchema):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Tentative d'insertion avec ON DUPLICATE KEY UPDATE
        query = """
            INSERT INTO citoyen (numero_cin, nom, prenom, date_naissance, lieu_naissance, sexe, profession, domicile, id_localite)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
                nom = VALUES(nom),
                prenom = VALUES(prenom),
                date_naissance = VALUES(date_naissance),
                lieu_naissance = VALUES(lieu_naissance),
                sexe = VALUES(sexe),
                profession = VALUES(profession),
                domicile = VALUES(domicile),
                id_localite = VALUES(id_localite)
        """
        cursor.execute(query, (
            citoyen.numero_cin, citoyen.nom, citoyen.prenom, 
            citoyen.date_naissance, citoyen.lieu_naissance, 
            citoyen.sexe, citoyen.profession, citoyen.domicile, 
            citoyen.id_localite
        ))
        conn.commit()
        return {"message": "Profil citoyen mis à jour avec succès"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@router.get("/citoyens/{cin}")
def get_citoyen(cin: str):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM citoyen WHERE numero_cin = %s", (cin,))
    citoyen = cursor.fetchone()
    cursor.close()
    conn.close()
    if not citoyen:
        raise HTTPException(status_code=404, detail="Citoyen non trouvé")
    return citoyen

@router.get("/citoyens/recherche/{prefixe}")
def recherche_nom(prefixe: str):
    trie = charger_trie()
    return {"suggestions": trie.rechercher_prefixe(prefixe)}
