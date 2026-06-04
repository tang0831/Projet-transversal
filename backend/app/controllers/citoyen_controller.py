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

@router.get("/citoyens/")
def get_all_citoyens():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM citoyen")
    citoyens = cursor.fetchall()
    cursor.close()
    conn.close()
    return citoyens

@router.put("/citoyens/{cin}")
def update_citoyen(cin: str, citoyen: CitoyenSchema):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        query = """
            UPDATE citoyen SET nom=%s, prenom=%s, date_naissance=%s, lieu_naissance=%s, sexe=%s, profession=%s, domicile=%s, id_localite=%s
            WHERE numero_cin=%s
        """
        cursor.execute(query, (citoyen.nom, citoyen.prenom, citoyen.date_naissance, citoyen.lieu_naissance, citoyen.sexe, citoyen.profession, citoyen.domicile, citoyen.id_localite, cin))
        conn.commit()
        return {"message": "Citoyen mis à jour"}
    finally:
        cursor.close()
        conn.close()

@router.delete("/citoyens/{cin}")
def delete_citoyen(cin: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM citoyen WHERE numero_cin = %s", (cin,))
        conn.commit()
        return {"message": "Citoyen supprimé"}
    finally:
        cursor.close()
        conn.close()

@router.get("/citoyens/{cin}/proches")
def get_proches(cin: str):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id FROM citoyen WHERE numero_cin = %s", (cin,))
        citoyen = cursor.fetchone()
        if not citoyen:
            raise HTTPException(status_code=404, detail="Citoyen non trouvé")
            
        query = """
            SELECT DISTINCT c.nom, c.prenom, c.numero_cin, 'Père/Mère' as type_lien
            FROM citoyen c
            WHERE c.id IN (
                SELECT id_parent FROM Lien_Parente WHERE id_enfant = %s
                UNION
                SELECT id_enfant FROM Lien_Parente WHERE id_parent = %s
            )
            UNION
            SELECT DISTINCT c.nom, c.prenom, c.numero_cin, 'Conjoint' as type_lien
            FROM citoyen c
            WHERE c.id IN (
                SELECT id_epoux FROM mariage WHERE id_epouse = %s
                UNION
                SELECT id_epouse FROM mariage WHERE id_epoux = %s
            )
            UNION
            SELECT DISTINCT c.nom, c.prenom, c.numero_cin, 'Frère/Sœur' as type_lien
            FROM citoyen c
            WHERE c.id IN (
                SELECT id_enfant FROM Lien_Parente 
                WHERE id_parent IN (SELECT id_parent FROM Lien_Parente WHERE id_enfant = %s)
            )
            AND c.id != %s
        """
        cursor.execute(query, (citoyen['id'], citoyen['id'], citoyen['id'], citoyen['id'], citoyen['id'], citoyen['id']))
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

@router.get("/citoyens/recherche/{prefixe}")
def recherche_nom(prefixe: str):
    trie = charger_trie()
    return {"suggestions": trie.rechercher_prefixe(prefixe)}
