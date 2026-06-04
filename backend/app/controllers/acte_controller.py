from fastapi import APIRouter, HTTPException, Response
from app.db.connection import get_db_connection
from pydantic import BaseModel
from typing import List, Optional
import io
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib import colors
import os

router = APIRouter()

def get_parents(citoyen_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    query = """
        SELECT c.nom, c.prenom, c.date_naissance, c.lieu_naissance, c.profession, c.domicile, c.numero_cin, lp.type_lien
        FROM Lien_Parente lp
        JOIN citoyen c ON lp.id_parent = c.id
        WHERE lp.id_enfant = %s
    """
    cursor.execute(query, (citoyen_id,))
    parents = cursor.fetchall()
    cursor.close()
    conn.close()
    return {
        "pere": next((p for p in parents if p['type_lien'] == 'PÈRE'), None),
        "mere": next((p for p in parents if p['type_lien'] == 'MÈRE'), None)
    }

class ParentInfo(BaseModel):
    nom: str
    prenom: str
    date_naissance: Optional[str] = None
    lieu_naissance: Optional[str] = None
    profession: Optional[str] = None
    domicile: Optional[str] = None
    numero_cin: Optional[str] = None

class BirthActResponse(BaseModel):
    numero_acte: int
    nom: str
    prenom: str
    date_naissance: str
    heure_naissance: Optional[str] = "08:00"
    lieu_naissance: str
    sexe: str
    pere: Optional[ParentInfo] = None
    mere: Optional[ParentInfo] = None
    date_declaration: str
    officier_etat_civil: str = "RAKOTOMALALA Jean Pierre"

class SpouseInfo(BaseModel):
    nom: str
    prenom: str
    profession: Optional[str] = None
    domicile: Optional[str] = None
    numero_cin: str

class MarriageActResponse(BaseModel):
    id_acte: int
    numero_acte: int
    date_mariage: str
    lieu_mariage: str
    regime: str
    statut: str
    id_demandeur: int
    epoux: SpouseInfo
    epouse: SpouseInfo
    epoux_parents: dict
    epouse_parents: dict
    officier: str = "RAKOTOMALALA Jean Pierre"

class DeathActResponse(BaseModel):
    numero_acte: int
    nom: str
    prenom: str
    date_deces: str
    lieu_deces: str
    cause_deces: Optional[str] = None
    officier: str = "RAKOTOMALALA Jean Pierre"

class DeathDeclarationSchema(BaseModel):
    numero_cin: str
    date_deces: str
    lieu_deces: str
    cause_deces: Optional[str] = None

class BirthDeclarationSchema(BaseModel):
    numero_cin: str
    nom: str
    prenom: str
    date_naissance: str
    heure_naissance: Optional[str] = "08:00"
    lieu_naissance: str
    sexe: str

class MarriageDeclarationSchema(BaseModel):
    numero_cin_demandeur: str
    numero_cin_conjoint: str
    date_mariage: str
    lieu_mariage: str
    regime: str

@router.post("/actes/naissance/declarer")
def declarer_naissance(data: BirthDeclarationSchema):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO citoyen (numero_cin, nom, prenom, date_naissance, lieu_naissance, sexe) VALUES (%s, %s, %s, %s, %s, %s)",
                       (data.numero_cin, data.nom, data.prenom, data.date_naissance, data.lieu_naissance, data.sexe))
        id_citoyen = cursor.lastrowid
        
        cursor.execute(
            "INSERT INTO acte (id_citoyen, type_acte, statut) VALUES (%s, 'NAISSANCE', 'OFFICIEL')",
            (id_citoyen,)
        )
        conn.commit()
        return {"message": "Naissance déclarée et acte généré automatiquement"}
    finally:
        cursor.close()
        conn.close()

@router.post("/actes/mariage/declarer")
def declarer_mariage(data: MarriageDeclarationSchema):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id FROM citoyen WHERE numero_cin = %s", (data.numero_cin_demandeur,))
        demandeur = cursor.fetchone()
        cursor.execute("SELECT id FROM citoyen WHERE numero_cin = %s", (data.numero_cin_conjoint,))
        conjoint = cursor.fetchone()
        
        if not demandeur or not conjoint:
            raise HTTPException(status_code=404, detail="Citoyen non trouvé")
            
        cursor.execute(
            "INSERT INTO acte (id_citoyen, type_acte, statut) VALUES (%s, 'MARIAGE', 'EN_ATTENTE_CONJOINT')",
            (demandeur['id'],)
        )
        id_acte = cursor.lastrowid
        
        cursor.execute(
            "INSERT INTO mariage (id_acte, id_epoux, id_epouse, date_mariage, lieu_mariage, regime_matrimonial) VALUES (%s, %s, %s, %s, %s, %s)",
            (id_acte, demandeur['id'], conjoint['id'], data.date_mariage, data.lieu_mariage, data.regime)
        )
        conn.commit()
        return {"message": "Demande de mariage déclarée avec succès", "id_acte": id_acte}
    finally:
        cursor.close()
        conn.close()

@router.get("/actes/mariage/pending/{cin}")
def get_pending_marriage_requests(cin: str):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id FROM citoyen WHERE numero_cin = %s", (cin,))
        citoyen = cursor.fetchone()
        if not citoyen:
            raise HTTPException(status_code=404, detail="Citoyen non trouvé")
            
        query = """
            SELECT m.*, a.id as id_acte, c1.nom as nom_demandeur, c1.prenom as prenom_demandeur
            FROM mariage m
            JOIN acte a ON m.id_acte = a.id
            JOIN citoyen c1 ON m.id_epoux = c1.id
            WHERE m.id_epouse = %s AND a.statut = 'EN_ATTENTE_CONJOINT'
        """
        cursor.execute(query, (citoyen['id'],))
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

@router.post("/actes/deces/declarer-par-proche")
def declarer_deces(data: DeathDeclarationSchema, requester_cin: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id FROM citoyen WHERE numero_cin = %s", (data.numero_cin,))
        deceased = cursor.fetchone()
        if not deceased:
            raise HTTPException(status_code=404, detail="Citoyen non trouvé")
            
        cursor.execute(
            "INSERT INTO acte (id_citoyen, type_acte, statut) VALUES (%s, 'DECES', 'EN_ATTENTE_OFFICIER')",
            (deceased[0],)
        )
        id_acte = cursor.lastrowid
        
        cursor.execute(
            "INSERT INTO deces (id_acte, id_citoyen, date_deces, lieu_deces, cause_deces) VALUES (%s, %s, %s, %s, %s)",
            (id_acte, deceased[0], data.date_deces, data.lieu_deces, data.cause_deces)
        )
        conn.commit()
        return {"message": "Déclaration de décès enregistrée"}
    finally:
        cursor.close()
        conn.close()

@router.get("/actes/naissance/{cin}", response_model=BirthActResponse)
def get_acte_naissance(cin: str):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        query_citoyen = """
            SELECT c.*, a.id as numero_acte, a.date_enregistrement as date_declaration
            FROM citoyen c
            JOIN acte a ON c.id = a.id_citoyen
            WHERE c.numero_cin = %s AND a.type_acte = 'NAISSANCE'
        """
        cursor.execute(query_citoyen, (cin,))
        citoyen = cursor.fetchone()
        
        if not citoyen:
            raise HTTPException(status_code=404, detail="Acte de naissance non trouvé pour ce CIN")
            
        query_parents = """
            SELECT c.nom, c.prenom, c.date_naissance, c.lieu_naissance, c.profession, c.domicile, c.numero_cin, lp.type_lien
            FROM Lien_Parente lp
            JOIN citoyen c ON lp.id_parent = c.id
            WHERE lp.id_enfant = %s
        """
        cursor.execute(query_parents, (citoyen['id'],))
        parents = cursor.fetchall()
        
        pere = next((p for p in parents if p['type_lien'] == 'PÈRE'), None)
        mere = next((p for p in parents if p['type_lien'] == 'MÈRE'), None)
        
        if pere: pere['date_naissance'] = str(pere['date_naissance'])
        if mere: mere['date_naissance'] = str(mere['date_naissance'])
        
        return {
            "numero_acte": citoyen['numero_acte'],
            "nom": citoyen['nom'],
            "prenom": citoyen['prenom'],
            "date_naissance": str(citoyen['date_naissance']),
            "heure_naissance": "08:00",
            "lieu_naissance": citoyen['lieu_naissance'],
            "sexe": "Masculin" if citoyen['sexe'] == 'M' else "Féminin",
            "pere": pere,
            "mere": mere,
            "date_declaration": citoyen['date_declaration'].strftime("%d/%m/%Y"),
            "officier_etat_civil": "RAKOTOMALALA Jean Pierre"
        }
    finally:
        cursor.close()
        conn.close()

@router.get("/actes/mariage/{cin}", response_model=MarriageActResponse)
def get_acte_mariage(cin: str):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute("SELECT id FROM citoyen WHERE numero_cin = %s", (cin,))
        citoyen = cursor.fetchone()
        if not citoyen:
            raise HTTPException(status_code=404, detail="Citoyen non trouvé")
            
        query = """
            SELECT m.*, a.id as id_acte, a.id as numero_acte, a.statut, a.id_citoyen as id_demandeur,
                   c1.id as id_epoux, c1.nom as nom_epoux, c1.prenom as prenom_epoux, c1.profession as prof_epoux, c1.domicile as dom_epoux, c1.numero_cin as cin_epoux,
                   c2.id as id_epouse, c2.nom as nom_epouse, c2.prenom as prenom_epouse, c2.profession as prof_epouse, c2.domicile as dom_epouse, c2.numero_cin as cin_epouse
            FROM mariage m
            JOIN acte a ON m.id_acte = a.id
            JOIN citoyen c1 ON m.id_epoux = c1.id
            JOIN citoyen c2 ON m.id_epouse = c2.id
            WHERE c1.id = %s OR c2.id = %s
        """
        cursor.execute(query, (citoyen['id'], citoyen['id']))
        mariage = cursor.fetchone()
        
        if not mariage:
            raise HTTPException(status_code=404, detail="Acte de mariage non trouvé")
            
        return {
            "id_acte": mariage['id_acte'],
            "numero_acte": mariage['numero_acte'],
            "date_mariage": str(mariage['date_mariage']),
            "lieu_mariage": mariage['lieu_mariage'],
            "regime": mariage['regime_matrimonial'],
            "statut": mariage['statut'],
            "id_demandeur": mariage['id_demandeur'],
            "epoux": {
                "nom": mariage['nom_epoux'],
                "prenom": mariage['prenom_epoux'],
                "profession": mariage['prof_epoux'],
                "domicile": mariage['dom_epoux'],
                "numero_cin": mariage['cin_epoux']
            },
            "epouse": {
                "nom": mariage['nom_epouse'],
                "prenom": mariage['prenom_epouse'],
                "profession": mariage['prof_epouse'],
                "domicile": mariage['dom_epouse'],
                "numero_cin": mariage['cin_epouse']
            },
            "epoux_parents": get_parents(mariage['id_epoux']),
            "epouse_parents": get_parents(mariage['id_epouse']),
            "officier": "RAKOTOMALALA Jean Pierre"
        }
    finally:
        cursor.close()
        conn.close()

@router.get("/actes/deces/liste-accessibles/{cin}")
def list_accessible_death_acts(cin: str):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id FROM citoyen WHERE numero_cin = %s", (cin,))
        requester = cursor.fetchone()
        if not requester: raise HTTPException(status_code=404, detail="Citoyen non trouvé")
        
        query = """
            SELECT d.*, a.id as numero_acte, c.nom, c.prenom, c.numero_cin
            FROM deces d
            JOIN acte a ON d.id_acte = a.id
            JOIN citoyen c ON d.id_citoyen = c.id
            WHERE a.statut = 'OFFICIEL'
            AND (
                c.id IN (SELECT id_parent FROM Lien_Parente WHERE id_enfant = %s)
                OR c.id IN (SELECT id_enfant FROM Lien_Parente WHERE id_parent = %s)
                OR c.id IN (SELECT id_epoux FROM mariage WHERE id_epouse = %s)
                OR c.id IN (SELECT id_epouse FROM mariage WHERE id_epoux = %s)
            )
        """
        cursor.execute(query, (requester['id'], requester['id'], requester['id'], requester['id']))
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

@router.get("/actes/deces/{cin}/{requester_cin}", response_model=DeathActResponse)
def get_acte_deces(cin: str, requester_cin: str):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        # Vérification d'autorisation
        if not verify_access(cursor, requester_cin, cin):
            raise HTTPException(status_code=403, detail="Accès non autorisé à cet acte")
            
        query = """
            SELECT d.*, a.id as numero_acte, c.nom, c.prenom
            FROM deces d
            JOIN acte a ON d.id_acte = a.id
            JOIN citoyen c ON d.id_citoyen = c.id
            WHERE c.numero_cin = %s
        """
        cursor.execute(query, (cin,))
        deces = cursor.fetchone()
        if not deces:
            raise HTTPException(status_code=404, detail="Acte de décès non trouvé")
        return {
            "numero_acte": deces['numero_acte'],
            "nom": deces['nom'],
            "prenom": deces['prenom'],
            "numero_cin": cin,
            "date_deces": str(deces['date_deces']),
            "lieu_deces": deces['lieu_deces'],
            "cause_deces": deces['cause_deces']
        }
    finally:
        cursor.close()
        conn.close()

def verify_access(cursor, requester_cin, deceased_cin):
    if requester_cin == deceased_cin: return True
    cursor.execute("SELECT id FROM citoyen WHERE numero_cin = %s", (requester_cin,))
    req = cursor.fetchone()
    cursor.execute("SELECT id FROM citoyen WHERE numero_cin = %s", (deceased_cin,))
    dec = cursor.fetchone()
    if not req or not dec: return False
    
    query_mariage = """
        SELECT 1 FROM mariage 
        WHERE (id_epoux = %s AND id_epouse = %s) OR (id_epoux = %s AND id_epouse = %s)
    """
    cursor.execute(query_mariage, (req['id'], dec['id'], dec['id'], req['id']))
    if cursor.fetchone(): return True
    
    query_parente = """
        SELECT 1 FROM Lien_Parente 
        WHERE (id_parent = %s AND id_enfant = %s) OR (id_parent = %s AND id_enfant = %s)
    """
    cursor.execute(query_parente, (req['id'], dec['id'], dec['id'], req['id']))
    if cursor.fetchone(): return True
    
    return False

@router.post("/actes/mariage/valider")
def valider_mariage(id_acte: int, cin_conjoint: str, action: str):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        if action == 'ACCEPTER':
            cursor.execute("UPDATE acte SET statut = 'EN_ATTENTE_OFFICIER' WHERE id = %s", (id_acte,))
        else:
            cursor.execute("UPDATE acte SET statut = 'REFUSE' WHERE id = %s", (id_acte,))
        conn.commit()
        return {"message": "Décision enregistrée"}
    finally:
        cursor.close()
        conn.close()

@router.get("/admin/actes/a-valider")
def get_actes_a_valider():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        query = """
            SELECT a.id, a.type_acte, a.date_enregistrement, c.nom, c.prenom, c.numero_cin
            FROM acte a
            JOIN citoyen c ON a.id_citoyen = c.id
            WHERE a.statut = 'EN_ATTENTE_OFFICIER'
        """
        cursor.execute(query)
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

@router.post("/admin/actes/{id_acte}/valider-officiel")
def valider_acte_officiel(id_acte: int):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("UPDATE acte SET statut = 'OFFICIEL' WHERE id = %s", (id_acte,))
        conn.commit()
        return {"message": "Acte validé avec succès"}
    finally:
        cursor.close()
        conn.close()

@router.get("/actes/naissance/{cin}/pdf")
def generate_birth_act_pdf(cin: str):
    data = get_acte_naissance(cin)
    seal_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../frontend/public/Seal_of_Madagascar.svg.png"))
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4
    if os.path.exists(seal_path):
        p.saveState()
        p.setFillAlpha(0.05)
        p.drawImage(seal_path, (width-18*cm)/2, (height-18*cm)/2, width=18*cm, height=18*cm, mask='auto')
        p.restoreState()
    if os.path.exists(seal_path):
        p.drawImage(seal_path, (width-2.5*cm)/2, height - 3.5*cm, width=2.5*cm, height=2.5*cm, mask='auto')
    
    p.setFont("Helvetica-Bold", 10)
    p.drawCentredString(width/2, height - 4*cm, "REPOBLIKAN'I MADAGASIKARA")
    p.setFont("Helvetica-Oblique", 7)
    p.drawCentredString(width/2, height - 4.4*cm, "Fitiavana - Tanindrazana - Fandrosoana")
    
    p.setFont("Helvetica-Bold", 18)
    p.drawCentredString(width/2, height - 6.5*cm, "COPIE D'ACTE DE NAISSANCE")
    p.setFont("Helvetica-Bold", 10)
    p.drawCentredString(width/2, height - 7.2*cm, f"EXTRAIT DU REGISTRE N° {data.get('numero_acte', 'N/A')}")
    
    p.setFont("Helvetica", 11)
    y = height - 9*cm
    
    p.setFont("Helvetica-Bold", 12)
    p.drawString(2*cm, y, "L'ENFANT")
    y -= 0.6*cm
    p.line(2*cm, y, 19*cm, y)
    y -= 0.8*cm
    
    p.setFont("Helvetica", 11)
    p.drawString(2.5*cm, y, f"Nom & Prénoms : {data.get('nom', '')} {data.get('prenom', '')}")
    y -= 0.6*cm
    p.drawString(2.5*cm, y, f"Né(e) le : {data.get('date_naissance', 'Non renseigné')} à {data.get('heure_naissance', '08:00')}")
    y -= 0.6*cm
    p.drawString(2.5*cm, y, f"Lieu : {data.get('lieu_naissance', 'Non renseigné')}")
    y -= 0.6*cm
    p.drawString(2.5*cm, y, f"Sexe : {data.get('sexe', 'Non renseigné')}")
    y -= 1.5*cm
    
    p.setFont("Helvetica-Bold", 12)
    p.drawString(2*cm, y, "FILIATION")
    y -= 0.6*cm
    p.line(2*cm, y, 19*cm, y)
    y -= 0.8*cm
    
    p.setFont("Helvetica-Bold", 11)
    p.drawString(2.5*cm, y, "Père :")
    p.setFont("Helvetica", 11)
    pere = data.get('pere')
    if pere:
        p.drawString(5*cm, y, f"{pere.get('nom', '')} {pere.get('prenom', '')}")
        y -= 0.6*cm
        p.drawString(5*cm, y, f"Né le {pere.get('date_naissance', 'N/A')} à {pere.get('lieu_naissance', 'N/A')}")
        y -= 0.6*cm
        p.drawString(5*cm, y, f"Profession : {pere.get('profession', 'N/A')}")
        y -= 0.6*cm
        p.drawString(5*cm, y, f"Domicile : {pere.get('domicile', 'N/A')}")
    else:
        p.drawString(5*cm, y, "Non renseigné")
    y -= 1*cm
    
    p.setFont("Helvetica-Bold", 11)
    p.drawString(2.5*cm, y, "Mère :")
    p.setFont("Helvetica", 11)
    mere = data.get('mere')
    if mere:
        p.drawString(5*cm, y, f"{mere.get('nom', '')} {mere.get('prenom', '')}")
        y -= 0.6*cm
        p.drawString(5*cm, y, f"Née le {mere.get('date_naissance', 'N/A')} à {mere.get('lieu_naissance', 'N/A')}")
        y -= 0.6*cm
        p.drawString(5*cm, y, f"Profession : {mere.get('profession', 'N/A')}")
        y -= 0.6*cm
        p.drawString(5*cm, y, f"Domicile : {mere.get('domicile', 'N/A')}")
    else:
        p.drawString(5*cm, y, "Non renseigné")
    y -= 2*cm
    
    p.setFont("Helvetica-Bold", 11)
    p.drawString(2*cm, y, "MENTIONS ADMINISTRATIVES")
    y -= 0.6*cm
    p.line(2*cm, y, 19*cm, y)
    y -= 0.8*cm
    
    p.setFont("Helvetica", 10)
    p.drawString(2.5*cm, y, f"Date de déclaration : {data.get('date_declaration', 'N/A')}")
    y -= 0.6*cm
    p.drawString(2.5*cm, y, f"Officier d'État Civil : {data.get('officier_etat_civil', 'RAKOTOMALALA Jean Pierre')}")
    
    p.setStrokeColor(colors.black)
    p.rect(width - 7*cm, 2*cm, 5*cm, 3*cm)
    p.setFont("Helvetica-Bold", 8)
    p.drawCentredString(width - 4.5*cm, 4.5*cm, "SIGNÉ ÉLECTRONIQUEMENT")
    p.drawCentredString(width - 4.5*cm, 4.1*cm, "SYSTÈME TOKANA-ID")
    p.setFont("Helvetica", 7)
    p.drawCentredString(width - 4.5*cm, 2.5*cm, "Vérification possible via QR Code")
    
    p.showPage()
    p.save()
    
    buffer.seek(0)
    return Response(content=buffer.getvalue(), media_type="application/pdf", headers={"Content-Disposition": f"inline; filename=acte_naissance_{cin}.pdf"})

@router.get("/actes/mariage/{cin}/pdf")
def generate_marriage_act_pdf(cin: str):
    data = get_acte_mariage(cin)
    
    # Vérification du statut avant génération
    if data['statut'] != 'OFFICIEL':
        raise HTTPException(status_code=403, detail="L'acte de mariage n'est pas encore validé officiellement.")

    seal_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../frontend/public/Seal_of_Madagascar.svg.png"))
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4
    if os.path.exists(seal_path):
        p.saveState()
        p.setFillAlpha(0.03)
        p.drawImage(seal_path, (width-18*cm)/2, (height-18*cm)/2, width=18*cm, height=18*cm, mask='auto')
        p.restoreState()
    if os.path.exists(seal_path):
        p.drawImage(seal_path, (width-2.5*cm)/2, height - 3.5*cm, width=2.5*cm, height=2.5*cm, mask='auto')
    p.setFont("Helvetica-Bold", 10)
    p.drawCentredString(width/2, height - 4*cm, "REPOBLIKAN'I MADAGASIKARA")
    p.setFont("Helvetica-Oblique", 7)
    p.drawCentredString(width/2, height - 4.4*cm, "Fitiavana - Tanindrazana - Fandrosoana")
    
    p.setFont("Helvetica-Bold", 18)
    p.drawCentredString(width/2, height - 6.5*cm, "ACTE DE MARIAGE")
    p.setFont("Helvetica-Bold", 10)
    p.drawCentredString(width/2, height - 7.2*cm, f"EXTRAIT DU REGISTRE N° {data['numero_acte']}")
    
    p.setFont("Helvetica", 11)
    y = height - 9*cm
    
    p.drawString(2*cm, y, f"Le {data['date_mariage']}, a été célébré à {data['lieu_mariage']} le mariage entre :")
    y -= 1.5*cm
    
    p.setFont("Helvetica-Bold", 12)
    p.drawString(2*cm, y, "L'ÉPOUX")
    y -= 0.6*cm
    p.line(2*cm, y, 19*cm, y)
    y -= 0.8*cm
    p.setFont("Helvetica", 11)
    p.drawString(2.5*cm, y, f"Nom & Prénoms : {data['epoux']['nom']} {data['epoux']['prenom']}")
    y -= 0.6*cm
    p.drawString(2.5*cm, y, f"CIN : {data['epoux']['numero_cin']}")
    y -= 0.6*cm
    p.drawString(2.5*cm, y, f"Profession : {data['epoux']['profession']}")
    y -= 0.6*cm
    
    pere_epoux = data['epoux_parents'].get('pere')
    mere_epoux = data['epoux_parents'].get('mere')
    if pere_epoux or mere_epoux:
        pere_nom = pere_epoux.get('nom', 'Inconnu') if pere_epoux else 'Inconnu'
        mere_nom = mere_epoux.get('nom', 'Inconnue') if mere_epoux else 'Inconnue'
        p.drawString(2.5*cm, y, f"Fils de : {pere_nom} et de {mere_nom}")
    y -= 1.5*cm

    p.setFont("Helvetica-Bold", 12)
    p.drawString(2*cm, y, "L'ÉPOUSE")
    y -= 0.6*cm
    p.line(2*cm, y, 19*cm, y)
    y -= 0.8*cm
    p.setFont("Helvetica", 11)
    p.drawString(2.5*cm, y, f"Nom & Prénoms : {data['epouse']['nom']} {data['epouse']['prenom']}")
    y -= 0.6*cm
    p.drawString(2.5*cm, y, f"CIN : {data['epouse']['numero_cin']}")
    y -= 0.6*cm
    p.drawString(2.5*cm, y, f"Profession : {data['epouse']['profession']}")
    y -= 0.6*cm
    
    pere_epouse = data['epouse_parents'].get('pere')
    mere_epouse = data['epouse_parents'].get('mere')
    if pere_epouse or mere_epouse:
        pere_nom = pere_epouse.get('nom', 'Inconnu') if pere_epouse else 'Inconnu'
        mere_nom = mere_epouse.get('nom', 'Inconnue') if mere_epouse else 'Inconnue'
        p.drawString(2.5*cm, y, f"Fille de : {pere_nom} et de {mere_nom}")
    y -= 2*cm
    
    p.setFont("Helvetica-Bold", 11)
    p.drawString(2*cm, y, "RÉGIME MATRIMONIAL :")
    p.setFont("Helvetica", 11)
    p.drawString(7*cm, y, data['regime'])
    y -= 2*cm
    
    p.setFont("Helvetica", 10)
    p.drawString(2.5*cm, y, f"Officier d'État Civil : {data['officier']}")
    
    p.setStrokeColor(colors.black)
    p.rect(width - 7*cm, 2*cm, 5*cm, 3*cm)
    p.setFont("Helvetica-Bold", 8)
    p.drawCentredString(width - 4.5*cm, 4.5*cm, "SIGNÉ ÉLECTRONIQUEMENT")
    p.drawCentredString(width - 4.5*cm, 4.1*cm, "SYSTÈME TOKANA-ID")
    
    p.showPage()
    p.save()
    
    buffer.seek(0)
    return Response(
        content=buffer.getvalue(),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"inline; filename=acte_mariage_{cin}.pdf"
        }
    )

@router.get("/actes/deces/{cin}/pdf")
def generate_death_act_pdf(cin: str):
    # Désactivé temporairement pour la démo
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT d.*, c.nom, c.prenom FROM deces d JOIN acte a ON d.id_acte = a.id JOIN citoyen c ON d.id_citoyen = c.id WHERE c.numero_cin = %s", (cin,))
    data = cursor.fetchone()
    cursor.close()
    conn.close()
    
    if not data:
        raise HTTPException(status_code=404, detail="Acte non trouvé")

    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=A4)
    # ... (logique PDF)
    p.setFont("Helvetica-Bold", 16)
    p.drawCentredString(width/2, height - 5*cm, "ACTE DE DÉCÈS")
    p.setFont("Helvetica", 12)
    p.drawString(2*cm, height - 7*cm, f"Le citoyen {data['nom']} {data['prenom']} est décédé le {str(data['date_deces'])} à {data['lieu_deces']}.")
    p.showPage()
    p.save()
    buffer.seek(0)
    return Response(content=buffer.getvalue(), media_type="application/pdf", headers={"Content-Disposition": f"inline; filename=acte_deces_{cin}.pdf"})
