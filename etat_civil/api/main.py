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


# --- BOYER-MOORE ---
def boyer_moore_search(text, pattern):
    m, n = len(pattern), len(text)
    if m == 0:
        return 0
    last = {pattern[i]: i for i in range(m)}
    i = m - 1
    k = m - 1
    while i < n:
        if text[i] == pattern[k]:
            if k == 0:
                return i
            else:
                i -= 1
                k -= 1
        else:
            j = last.get(text[i], -1)
            i += m - min(k, j + 1)
            k = m - 1
    return -1


# --- AUTH ---
@app.post("/auth/login")
def login(req: LoginRequest):
    user_model = Utilisateur()
    user = user_model.verifier_identifiants(req.username, req.password)
    if user:
        # user tuple: (id, nom, pwd, role, id_citoyen)
        return {
            "access_token": "fake-token",
            "token_type": "bearer",
            "username": user[1],
            "role": user[3],
            "id_citoyen": user[4],
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
def get_localites():
    loc = Localite()
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
def get_citoyens(search: Optional[str] = None):
    cit_model = Citoyen()
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
    )
    return {"message": "Citoyen modifié"}


@app.delete("/citoyens/{id_citoyen}")
def delete_citoyen(id_citoyen: int):
    cit_model = Citoyen()
    cit_model.supprimer_citoyen(id_citoyen)
    return {"message": "Citoyen supprimé"}


# --- ACTES ---
@app.get("/actes", response_model=List[ActeOut])
def get_actes():
    acte_model = Acte()
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
