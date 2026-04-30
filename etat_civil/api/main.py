import io
from datetime import datetime
from typing import List, Optional

from backend.models.acte import Acte
from backend.models.citoyen import Citoyen
from backend.models.localite import Localite
from backend.models.utilisateur import Utilisateur
from backend.utils.pdf_generator import generate_acte_pdf
from fastapi import Depends, FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.models.forum import ForumModel, DemandeActeModel

app = FastAPI(title="Vision 2035 - État Civil API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- MODELS ---
class MessageCreate(BaseModel):
    id_utilisateur: int
    contenu: str

class DemandeCreate(BaseModel):
    id_utilisateur: int
    type_acte: str

class StatutUpdate(BaseModel):
    statut: str

class UserUpdate(BaseModel):
    nom: str
    mot_de_passe: str
    role: str
    id_localite: Optional[int] = None
    photo: Optional[str] = None

class LoginRequest(BaseModel):
    username: str
    password: str


class LocaliteBase(BaseModel):
    nom_commune: str
    district: str
    region: str
    code_postal: str


class LocaliteOut(LocaliteBase):
    id_localite: int


class CitoyenBase(BaseModel):
    nom: str
    prenom: str
    date_naissance: str
    lieu_naissance: str
    est_vivant: bool
    sexe: str
    numero_cin: str
    id_localite: Optional[int] = None


class CitoyenOut(CitoyenBase):
    id_citoyen: int


class ActeBase(BaseModel):
    type_acte: str
    date_acte: str
    numero_registre: str
    id_citoyen: Optional[int] = None


class ActeOut(BaseModel):
    id_acte: int
    type_acte: str
    date_acte: str
    numero_registre: str
    date_registrement: str


from backend.structures.boyer_moore import boyer_moore_search

# --- AUTH ---
@app.post("/auth/login")
def login(req: LoginRequest):
    user_model = Utilisateur()
    user = user_model.verifier_identifiants(req.username, req.password)
    if user:
        # user tuple: (id_utilisateur, nom, mot_de_passe, role, id_localite)
        id_localite = user[4]
        region = None
        if id_localite:
            loc_model = Localite()
            region = loc_model.obtenir_region_par_id(id_localite)

        return {
            "access_token": "fake-token",
            "token_type": "bearer",
            "id_utilisateur": user[0],
            "username": user[1],
            "role": user[3],
            "id_localite": id_localite,
            "region": region,
        }
    raise HTTPException(status_code=401, detail="Identifiants invalides")


# --- CITIZEN SPECIFIC ---
@app.get("/my-actes/{id_citoyen}")
def get_my_actes(id_citoyen: int):
    acte_model = Acte()
    res = acte_model.lister_par_citoyen(id_citoyen)
    return [
        {
            "id_acte": r[0],
            "type_acte": r[1],
            "date_acte": str(r[2]),
            "numero_registre": r[3],
            "date_registrement": str(r[4]),
        }
        for r in res
    ]


@app.get("/actes/{id_acte}/pdf")
def download_acte_pdf(id_acte: int):
    acte_model = Acte()
    acte_data = acte_model.obtenir_acte_complet(id_acte)
    if not acte_data:
        raise HTTPException(status_code=404, detail="Acte non trouvé")

    # Si c'est un acte de décès, on marque le citoyen comme décédé
    if acte_data[1] == "DECES" and acte_data[5]:
        cit_model = Citoyen()
        cit_model.marquer_comme_decede(acte_data[5])

    pdf_content = generate_acte_pdf(acte_data)
    return Response(
        content=pdf_content,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=acte_{id_acte}.pdf"},
    )


# --- LOCALITES ---
@app.get("/localites", response_model=List[LocaliteOut])
def get_localites(region: Optional[str] = None):
    loc = Localite()
    if region:
        res = loc.lister_par_region(region)
    else:
        res = loc.lister_tout()
    return [
        {
            "id_localite": r[0],
            "nom_commune": r[1],
            "district": r[2],
            "region": r[3],
            "code_postal": r[4],
        }
        for r in res
    ]


@app.post("/localites")
def create_localite(loc_data: LocaliteBase):
    loc = Localite()
    loc.ajouter_localite(
        loc_data.nom_commune, loc_data.district, loc_data.region, loc_data.code_postal
    )
    return {"message": "Localité ajoutée"}


@app.put("/localites/{id_localite}")
def update_localite(id_localite: int, loc_data: LocaliteBase):
    loc = Localite()
    loc.modifier_localite(
        id_localite,
        loc_data.nom_commune,
        loc_data.district,
        loc_data.region,
        loc_data.code_postal,
    )
    return {"message": "Localité modifiée"}


@app.delete("/localites/{id_localite}")
def delete_localite(id_localite: int):
    loc = Localite()
    loc.supprimer_localite(id_localite)
    return {"message": "Localité supprimée"}


# --- CITOYENS ---
@app.get("/citoyens", response_model=List[CitoyenOut])
def get_citoyens(search: Optional[str] = None, region: Optional[str] = None):
    cit_model = Citoyen()
    if region:
        res = cit_model.lister_par_region(region)
    else:
        res = cit_model.lister_tout()
        
    all_citoyens = [
        {
            "id_citoyen": r[0],
            "numero_cin": r[1],
            "nom": r[2],
            "prenom": r[3],
            "date_naissance": str(r[4]),
            "lieu_naissance": r[5],
            "est_vivant": bool(r[6]),
            "sexe": r[7],
            "id_localite": r[8],
        }
        for r in res
    ]

    if search:
        search = search.upper()
        return [
            c
            for c in all_citoyens
            if boyer_moore_search(c["nom"].upper(), search) != -1
        ]

    return all_citoyens


@app.post("/citoyens")
def create_citoyen(c: CitoyenBase):
    cit_model = Citoyen()
    cit_model.ajouter_citoyen(
        c.nom,
        c.prenom,
        c.date_naissance,
        c.lieu_naissance,
        c.est_vivant,
        c.sexe,
        c.numero_cin,
        c.id_localite,
    )
    return {"message": "Citoyen ajouté"}


@app.put("/citoyens/{id_citoyen}")
def update_citoyen(id_citoyen: int, c: CitoyenBase):
    cit_model = Citoyen()
    cit_model.modifier_citoyen(
        id_citoyen,
        c.nom,
        c.prenom,
        c.date_naissance,
        c.lieu_naissance,
        c.est_vivant,
        c.sexe,
        c.numero_cin,
        c.id_localite,
    )
    return {"message": "Citoyen modifié"}


@app.delete("/citoyens/{id_citoyen}")
def delete_citoyen(id_citoyen: int):
    cit_model = Citoyen()
    cit_model.supprimer_citoyen(id_citoyen)
    return {"message": "Citoyen supprimé"}


# --- ACTES ---
@app.get("/actes", response_model=List[ActeOut])
def get_actes(region: Optional[str] = None):
    acte_model = Acte()
    if region:
        res = acte_model.lister_par_region(region)
    else:
        res = acte_model.lister_tout()
        
    return [
        {
            "id_acte": r[0],
            "type_acte": r[1],
            "date_acte": str(r[2]),
            "numero_registre": r[3],
            "date_registrement": str(r[4]),
        }
        for r in res
    ]


@app.post("/actes")
def create_acte(a: ActeBase):
    acte_model = Acte()
    acte_model.ajouter_acte(
        a.type_acte,
        a.date_acte,
        a.numero_registre,
        datetime.now().strftime("%Y-%m-%d"),
        a.id_citoyen,
    )
    return {"message": "Acte ajouté"}


@app.put("/actes/{id_acte}")
def update_acte(id_acte: int, a: ActeBase):
    acte_model = Acte()
    acte_model.modifier_acte(
        id_acte,
        a.type_acte,
        a.date_acte,
        a.numero_registre,
        datetime.now().strftime("%Y-%m-%d"),
    )
    return {"message": "Acte modifié"}


@app.delete("/actes/{id_acte}")
def delete_acte(id_acte: int):
    acte_model = Acte()
    acte_model.supprimer_acte(id_acte)
    return {"message": "Acte supprimé"}


# --- STATS ---
@app.get("/stats")
def get_stats():
    # C'est une version simplifiée, on pourrait faire des vraies queries COUNT
    cit_model = Citoyen()
    acte_model = Acte()
    loc_model = Localite()

    citoyens = cit_model.lister_tout()
    actes = acte_model.lister_tout()
    localites = loc_model.lister_tout()

    return {
        "total_citoyens": len(citoyens),
        "total_actes": len(actes),
        "total_localites": len(localites),
        "vivants": len([c for c in citoyens if c[6]]),  # Index 6 pour est_vivant
        "actes_naissance": len([a for a in actes if a[1] == "NAISSANCE"]),
        "actes_deces": len([a for a in actes if a[1] == "DECES"]),
        "actes_mariage": len([a for a in actes if a[1] == "MARIAGE"]),
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)

# --- FORUM & DEMANDES ---
@app.get("/forum/messages")
def get_forum_messages():
    model = ForumModel()
    res = model.lister_messages()
    return [
        {
            "id_message": r[0],
            "contenu": r[1],
            "date_envoi": str(r[2]),
            "username": r[3],
            "role": r[4]
        }
        for r in res
    ]

@app.post("/forum/messages")
def post_forum_message(msg: MessageCreate):
    model = ForumModel()
    model.ajouter_message(msg.id_utilisateur, msg.contenu)
    return {"message": "Message envoyé"}

@app.get("/demandes")
def get_demandes(id_utilisateur: Optional[int] = None):
    model = DemandeActeModel()
    if id_utilisateur:
        res = model.lister_par_utilisateur(id_utilisateur)
        return [
            {
                "id_demande": r[0],
                "id_utilisateur": r[1],
                "type_acte": r[2],
                "statut": r[3],
                "date_demande": str(r[4])
            }
            for r in res
        ]
    else:
        res = model.lister_toutes()
        return [
            {
                "id_demande": r[0],
                "type_acte": r[1],
                "statut": r[2],
                "date_demande": str(r[3]),
                "username": r[4]
            }
            for r in res
        ]

@app.post("/demandes")
def create_demande(dem: DemandeCreate):
    model = DemandeActeModel()
    model.creer_demande(dem.id_utilisateur, dem.type_acte)
    return {"message": "Demande créée"}

@app.put("/demandes/{id_demande}")
def update_demande_statut(id_demande: int, status: StatutUpdate):
    model = DemandeActeModel()
    model.mettre_a_jour_statut(id_demande, status.statut)
    return {"message": "Statut mis à jour"}

# --- USER PROFILE ---
@app.get("/users/{id_utilisateur}")
def get_user_profile(id_utilisateur: int):
    model = Utilisateur()
    user = model.obtenir_utilisateur(id_utilisateur)
    if user:
        return {
            "id_utilisateur": user[0],
            "nom": user[1],
            "mot_de_passe": user[2],
            "role": user[3],
            "id_localite": user[4],
            "photo": user[5] if len(user) > 5 else None
        }
    raise HTTPException(status_code=404, detail="Utilisateur non trouvé")

@app.put("/users/{id_utilisateur}")
def update_user_profile(id_utilisateur: int, u: UserUpdate):
    try:
        model = Utilisateur()
        model.modifier_utilisateur(id_utilisateur, u.nom, u.mot_de_passe, u.role, u.id_localite, u.photo)
        return {"message": "Profil mis à jour"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
