from fastapi import APIRouter, HTTPException
from app.db.connection import get_db_connection

router = APIRouter()

@router.post("/login")
def login(nom_utilisateur: str, mot_de_passe: str):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Vérification utilisateur et jointure avec citoyen pour vérifier la complétion
        cursor.execute("""
            SELECT u.id, u.role, u.numero_cin, c.profession, c.domicile, c.lieu_naissance
            FROM utilisateur u
            LEFT JOIN citoyen c ON u.numero_cin = c.numero_cin
            WHERE u.nom_utilisateur = %s AND u.mot_de_passe = %s
        """, (nom_utilisateur, mot_de_passe))
        
        utilisateur = cursor.fetchone()
        
        if not utilisateur:
            raise HTTPException(status_code=401, detail="Nom d'utilisateur ou mot de passe incorrect")
        
        # Trouver le citoyen associé
        citoyen_id = None
        if utilisateur["numero_cin"]:
            cursor.execute("SELECT id FROM citoyen WHERE numero_cin = %s", (utilisateur["numero_cin"],))
            citoyen = cursor.fetchone()
            if citoyen:
                citoyen_id = citoyen["id"]
        
        # Vérification si le profil est complet (si profession, domicile ou lieu_naissance est NULL)
        profil_incomplet = (
            utilisateur["profession"] is None or 
            utilisateur["domicile"] is None or 
            utilisateur["lieu_naissance"] is None
        )
        
        return {
            "message": "Connexion réussie",
            "id": utilisateur["id"],
            "citoyen_id": citoyen_id,
            "role": utilisateur["role"],
            "numero_cin": utilisateur["numero_cin"],
            "profil_incomplet": profil_incomplet
        }
    finally:
        cursor.close()
        conn.close()

@router.post("/register")
def register(nom_utilisateur: str, mot_de_passe: str, role: str, id_localite: int, numero_cin: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO utilisateur (nom_utilisateur, mot_de_passe, role, id_localite, numero_cin) VALUES (%s, %s, %s, %s, %s)",
            (nom_utilisateur, mot_de_passe, role, id_localite, numero_cin)
        )
        conn.commit()
        return {"message": "Utilisateur inscrit avec succès"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close()
        conn.close()
