import io
from datetime import datetime
from typing import List, Optional

from fastapi import Depends, FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.models.acte import Acte
from backend.models.citoyen import Citoyen
from backend.models.forum import DemandeActeModel, ForumModel
from backend.models.localite import Localite
from backend.models.utilisateur import Utilisateur
from backend.utils.pdf_generator import generate_acte_pdf

app = FastAPI(title="Tokana ID - État Civil API")

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
    id_citoyen_concerne: Optional[int] = None
    # Champs additionnels pour déclaration/demande complète
    nom_complet: Optional[str] = None
    date_naissance: Optional[str] = None
    lieu_naissance: Optional[str] = None
    nom_pere: Optional[str] = None
    prof_pere: Optional[str] = None
    date_nais_pere: Optional[str] = None
    nom_mere: Optional[str] = None
    prof_mere: Optional[str] = None
    date_nais_mere: Optional[str] = None
    adresse: Optional[str] = None
    profession_demandeur: Optional[str] = None


class StatutUpdate(BaseModel):
    statut: str


class UserUpdate(BaseModel):
    nom: str
    mot_de_passe: str
    role: str
    id_localite: Optional[int] = None
    photo: Optional[str] = None
    # Champs citoyen liés
    prenom: Optional[str] = None
    date_naissance: Optional[str] = None
    lieu_naissance: Optional[str] = None
    numero_cin: Optional[str] = None
    profession: Optional[str] = None
    adresse: Optional[str] = None
    situation_matrimoniale: Optional[str] = None
    # Détails parents pour pré-remplissage actes
    nom_pere: Optional[str] = None
    prenom_pere: Optional[str] = None
    date_nais_pere: Optional[str] = None
    prof_pere: Optional[str] = None
    nom_mere: Optional[str] = None
    prenom_mere: Optional[str] = None
    date_nais_mere: Optional[str] = None
    prof_mere: Optional[str] = None


class LoginRequest(BaseModel):
    username: str
    password: str


class RegisterRequest(BaseModel):
    username: str
    password: str
    role: str
    id_localite: Optional[int] = None


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
    profession: Optional[str] = None
    adresse: Optional[str] = None
    id_pere: Optional[int] = None
    id_mere: Optional[int] = None
    situation_matrimoniale: Optional[str] = "CÉLIBATAIRE"


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
from backend.structures.trie import Trie
from backend.structures.avl import AVLTree


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


@app.post("/auth/register")
def register(req: RegisterRequest):
    user_model = Utilisateur()
    try:
        user_model.ajouter_utilisateur(req.username, req.password, req.role, req.id_localite)
        return {"message": "Utilisateur créé avec succès"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


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
    r = acte_model.obtenir_acte_complet(id_acte)
    if not r:
        raise HTTPException(status_code=404, detail="Acte non trouvé")

    # r est un tuple (id_acte, type_acte, date_acte, numero_registre, date_registrement, id_citoyen, id_utilisateur, ...)
    # Mapping selon la nouvelle requête SQL dans acte.py
    data = {
        "id_acte": r[0],
        "type_acte": r[1],
        "date_acte": str(r[2]),
        "numero_registre": r[3],
        "annee_registre": str(r[2].year) if r[2] else "N/A",
        "kaominina": r[22] if len(r) > 22 else "MAHANORO",
        "distrika": r[23] if len(r) > 23 else "MAHANORO",
        "faritra": r[24] if len(r) > 24 else "ATSINANANA",
        # Enfant / Défunt / Époux (r[7], r[8])
        "nom_enfant": r[7],
        "prenom_enfant": r[8],
        "date_naissance": str(r[10]),
        "lieu_naissance": r[11],
        "sexe_enfant": r[12],
        "nom_pere": r[15],
        "prenom_pere": r[16],
        "profession_pere": r[17],
        "age_pere": (datetime.now().year - r[18].year) if (len(r) > 18 and r[18]) else "...",
        "nom_mere": r[19],
        "prenom_mere": r[20],
        "profession_mere": r[21],
        "age_mere": (datetime.now().year - r[22].year) if (len(r) > 22 and r[22]) else "...",
        "domicile_parents": r[14],
        # Pour les décès
        "nom_defunt": r[7],
        "prenom_defunt": r[8],
        "date_deces": str(r[2]),
        "lieu_deces": r[11],
        "profession_defunt": r[13],
        "age_defunt": (datetime.now().year - r[10].year) if r[10] else "...",
        "pere_defunt": f"{r[16]} {r[15]}" if r[15] else "...",
        "mere_defunt": f"{r[20]} {r[19]}" if r[19] else "...",
        # Pour les mariages (r[25] à r[30])
        "date_mariage": str(r[2]),
        "heure_mariage": "10:00", # Exemple
        "lieu_mariage": r[22],
        "nom_epoux": r[7],
        "prenom_epoux": r[8],
        "date_nais_epoux": str(r[10]),
        "lieu_nais_epoux": r[11],
        "pere_epoux": f"{r[16]} {r[15]}" if r[15] else "...",
        "mere_epoux": f"{r[20]} {r[19]}" if r[19] else "...",
        "nom_epouse": r[25] if len(r) > 25 else "...",
        "prenom_epouse": r[26] if len(r) > 26 else "...",
        "date_nais_epouse": str(r[27]) if len(r) > 27 else "...",
        "lieu_nais_epouse": r[28] if len(r) > 28 else "...",
        "pere_epouse": r[29] if len(r) > 29 else "...",
        "mere_epouse": r[30] if len(r) > 30 else "...",
        "date_livraison": datetime.now().strftime("%d/%m/%Y"),
    }

    # Si c'est un acte de décès, on marque le citoyen comme décédé
    if data["type_acte"] == "DECES" and r[5]:
        cit_model = Citoyen()
        cit_model.marquer_comme_decede(r[5])

    pdf_content = generate_acte_pdf(data)
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


@app.get("/localites/hierarchie")
def get_localites_hierarchie():
    loc_model = Localite()
    localites = loc_model.lister_tout()
    
    # On utilise l'AVL pour trier et structurer par Région > District > Commune
    tree = AVLTree()
    root = None
    
    # Dictionnaire temporaire pour construire la hiérarchie
    hierarchy = {}
    
    for l in localites:
        # l = (id, commune, district, region, cp)
        region = l[3]
        district = l[2]
        commune = l[1]
        
        if region not in hierarchy:
            hierarchy[region] = {}
        if district not in hierarchy[region]:
            hierarchy[region][district] = []
        hierarchy[region][district].append(commune)
        
    # On insère les régions dans l'AVL pour avoir une liste triée et équilibrée
    for region in hierarchy.keys():
        root = tree.insert(root, region, hierarchy[region])
        
    # On récupère le résultat via un parcours inorder pour garantir l'ordre alphabétique
    res = []
    tree.inorder(root, res)
    
    return [
        {"region": item[0], "districts": [
            {"name": d, "communes": hierarchy[item[0]][d]} for d in item[1].keys()
        ]} for item in res
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
@app.get("/citoyens/autocomplete")
def autocomplete_citoyens(prefix: str):
    cit_model = Citoyen()
    res = cit_model.lister_tout()
    
    trie = Trie()
    for r in res:
        # On insère le nom et le prénom dans le Trie
        # r[2] est le nom, r[3] est le prénom
        if r[2]:
            trie.insert(r[2].upper(), {"id": r[0], "display": f"{r[2]} {r[3] or ''}"})
        if r[3]:
            # On peut aussi insérer par prénom pour plus de souplesse
            trie.insert(r[3].upper(), {"id": r[0], "display": f"{r[3]} {r[2]}"})
            
    matches = trie.starts_with(prefix.upper())
    # On limite à 10 résultats pour la performance
    return matches[:10]


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
            "profession": r[9] if len(r) > 9 else None,
            "adresse": r[10] if len(r) > 10 else None,
            "id_pere": r[11] if len(r) > 11 else None,
            "id_mere": r[12] if len(r) > 12 else None,
            "situation_matrimoniale": r[13] if len(r) > 13 else "CÉLIBATAIRE",
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
        c.profession,
        c.adresse,
        c.id_pere,
        c.id_mere,
        c.situation_matrimoniale,
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
        c.profession,
        c.adresse,
        c.id_pere,
        c.id_mere,
        c.situation_matrimoniale,
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
            "role": r[4],
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
                "date_demande": str(r[4]),
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
                "username": r[4],
            }
            for r in res
        ]


@app.post("/demandes")
def create_demande(dem: DemandeCreate):
    model = DemandeActeModel()
    
    # Si c'est un acte de décès, on vérifie le lien de parenté
    if dem.type_acte.upper() == "DÉCÈS" or dem.type_acte.upper() == "DECES":
        user_model = Utilisateur()
        user = user_model.obtenir_utilisateur(dem.id_utilisateur)
        
        # L'index 6 correspond au champ id_citoyen ajouté
        if not user or len(user) <= 6 or not user[6]:
            raise HTTPException(status_code=403, detail="Votre compte n'est pas lié à un citoyen. Vérification impossible.")
            
        if not dem.id_citoyen_concerne:
            raise HTTPException(status_code=400, detail="L'ID du citoyen concerné est requis pour un acte de décès.")
            
        cit_model = Citoyen()
        est_autorise, raison = cit_model.verifier_lien_familial(user[6], dem.id_citoyen_concerne)
        
        if not est_autorise:
            raise HTTPException(status_code=403, detail=f"Accès refusé : {raison}. Seuls les membres de la famille proche peuvent demander cet acte.")

    # On prépare les données complémentaires
    donnees = {
        "nom_complet": dem.nom_complet,
        "date_naissance": dem.date_naissance,
        "lieu_naissance": dem.lieu_naissance,
        "nom_pere": dem.nom_pere,
        "prof_pere": dem.prof_pere,
        "date_nais_pere": dem.date_nais_pere,
        "nom_mere": dem.nom_mere,
        "prof_mere": dem.prof_mere,
        "date_nais_mere": dem.date_nais_mere,
        "adresse": dem.adresse,
        "profession_demandeur": dem.profession_demandeur
    }

    model.creer_demande(dem.id_utilisateur, dem.type_acte, donnees)
    return {"message": "Demande créée avec succès"}


@app.put("/demandes/{id_demande}")
def update_demande_statut(id_demande: int, status: StatutUpdate):
    import json
    model = DemandeActeModel()
    model.mettre_a_jour_statut(id_demande, status.statut)

    # Si la demande est approuvée, on génère automatiquement l'acte
    if status.statut.upper() in ["APPROUVÉE", "APPROUVEE", "VALIDÉE", "VALIDEE"]:
        demande = model.obtenir_demande(id_demande)
        if demande:
            # demande tuple: (id_demande, id_user, type_act, statut, date, donnees_json)
            id_user = demande[1]
            type_act = demande[2]
            donnees_json = demande[5]
            
            donnees = json.loads(donnees_json) if donnees_json else {}

            user_model = Utilisateur()
            user = user_model.obtenir_utilisateur(id_user)

            if user:
                cit_model = Citoyen()
                # On cherche si un citoyen existe déjà pour cet utilisateur
                id_citoyen_pivot = user[6] # index 6 pour id_citoyen
                
                target_citoyen_id = id_citoyen_pivot
                
                # Si les données complémentaires sont présentes, on met à jour ou on crée
                if donnees:
                    nom = donnees.get("nom_complet", user[1]).upper()
                    prenom = "" # On pourrait spliter si besoin
                    if " " in nom:
                        parts = nom.split(" ", 1)
                        nom = parts[0]
                        prenom = parts[1]

                    # Logique simplifiée : si pas de citoyen lié, on en crée un
                    if not target_citoyen_id:
                        cit_model.ajouter_citoyen(
                            nom, prenom, 
                            donnees.get("date_naissance", "2000-01-01"),
                            donnees.get("lieu_naissance", "Inconnu"),
                            True, "M", "N/A", user[4],
                            donnees.get("profession_demandeur"),
                            donnees.get("adresse")
                        )
                        # On récupère le dernier ID inséré (approche simplifiée)
                        res_last = cit_model.conn.execute_query("SELECT LAST_INSERT_ID()")
                        target_citoyen_id = res_last[0][0] if res_last else None
                        # On lie l'utilisateur à ce nouveau citoyen
                        user_model.modifier_utilisateur(id_user, id_citoyen=target_citoyen_id)
                    else:
                        # On met à jour les infos existantes
                        cit_model.modifier_citoyen(
                            target_citoyen_id,
                            nom, prenom,
                            donnees.get("date_naissance", "2000-01-01"),
                            donnees.get("lieu_naissance", "Inconnu"),
                            True, "M", "N/A", user[4],
                            donnees.get("profession_demandeur"),
                            donnees.get("adresse")
                        )

                if target_citoyen_id:
                    acte_model = Acte()
                    num_reg = f"REG-{datetime.now().year}-{id_demande}"
                    
                    id_conjoint = None
                    if type_act.upper() == "MARIAGE":
                        cit_model.marquer_comme_marie(target_citoyen_id)

                    acte_model.ajouter_acte(
                        type_act,
                        datetime.now().strftime("%Y-%m-%d"),
                        num_reg,
                        datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                        target_citoyen_id,
                        id_conjoint
                    )

    return {"message": "Statut mis à jour, citoyen actualisé et acte généré si approuvé"}


# --- USER PROFILE ---
@app.get("/users/{id_utilisateur}")
def get_user_profile(id_utilisateur: int):
    model = Utilisateur()
    user = model.obtenir_utilisateur(id_utilisateur)
    if user:
        # user tuple: (id, nom, mdp, role, id_loc, photo, id_citoyen)
        res = {
            "id_utilisateur": user[0],
            "nom": user[1],
            "mot_de_passe": user[2],
            "role": user[3],
            "id_localite": user[4],
            "photo": user[5] if len(user) > 5 else None,
            "id_citoyen": user[6] if len(user) > 6 else None,
        }
        
        # On enrichit avec les données citoyen si l'ID est présent
        if res["id_citoyen"]:
            cit_model = Citoyen()
            c = cit_model.obtenir_citoyen(res["id_citoyen"])
            if c:
                # c = (id, cin, nom, prenom, nais, lieu, vivant, sexe, loc, prof, adr, pere, mere, sit)
                res.update({
                    "numero_cin": c[1],
                    "prenom": c[3],
                    "date_naissance": str(c[4]),
                    "lieu_naissance": c[5],
                    "profession": c[9],
                    "adresse": c[10],
                    "id_pere": c[11],
                    "id_mere": c[12],
                    "situation_matrimoniale": c[13] if len(c) > 13 else "CÉLIBATAIRE"
                })
                
                # Récupération infos Père
                if c[11]:
                    p = cit_model.obtenir_citoyen(c[11])
                    if p:
                        res.update({
                            "nom_pere": p[2],
                            "prenom_pere": p[3],
                            "date_nais_pere": str(p[4]),
                            "prof_pere": p[9]
                        })
                
                # Récupération infos Mère
                if c[12]:
                    m = cit_model.obtenir_citoyen(c[12])
                    if m:
                        res.update({
                            "nom_mere": m[2],
                            "prenom_mere": m[3],
                            "date_nais_mere": str(m[4]),
                            "prof_mere": m[9]
                        })
        return res
    raise HTTPException(status_code=404, detail="Utilisateur non trouvé")


@app.put("/users/{id_utilisateur}")
def update_user_profile(id_utilisateur: int, u: UserUpdate):
    try:
        model = Utilisateur()
        model.modifier_utilisateur(
            id_utilisateur, nom=u.nom, mot_de_passe=u.mot_de_passe, role=u.role, id_localite=u.id_localite, photo=u.photo
        )
        
        user = model.obtenir_utilisateur(id_utilisateur)
        if user:
            cit_model = Citoyen()
            target_id = user[6]
            
            # 1. Gérer/Créer le Père si infos fournies
            id_pere = None
            if u.nom_pere:
                # Recherche simplifiée ou création
                res_p = cit_model.conn.execute_query("SELECT id_citoyen FROM Citoyen WHERE nom = %s AND prenom = %s", (u.nom_pere.upper(), u.prenom_pere or ""))
                if res_p:
                    id_pere = res_p[0][0]
                else:
                    cit_model.ajouter_citoyen(u.nom_pere.upper(), u.prenom_pere or "", u.date_nais_pere or "1970-01-01", "Inconnu", True, "M", "N/A", u.id_localite, u.prof_pere)
                    id_pere = cit_model.conn.execute_query("SELECT LAST_INSERT_ID()")[0][0]

            # 2. Gérer/Créer la Mère
            id_mere = None
            if u.nom_mere:
                res_m = cit_model.conn.execute_query("SELECT id_citoyen FROM Citoyen WHERE nom = %s AND prenom = %s", (u.nom_mere.upper(), u.prenom_mere or ""))
                if res_m:
                    id_mere = res_m[0][0]
                else:
                    cit_model.ajouter_citoyen(u.nom_mere.upper(), u.prenom_mere or "", u.date_nais_mere or "1970-01-01", "Inconnu", True, "F", "N/A", u.id_localite, u.prof_mere)
                    id_mere = cit_model.conn.execute_query("SELECT LAST_INSERT_ID()")[0][0]

            # 3. Mettre à jour le citoyen principal
            if target_id:
                cit_model.modifier_citoyen(
                    target_id, u.nom.upper(), u.prenom or "", u.date_naissance or "2000-01-01",
                    u.lieu_naissance or "Inconnu", True, "M", u.numero_cin or "N/A",
                    u.id_localite, u.profession, u.adresse, id_pere, id_mere, u.situation_matrimoniale or "CÉLIBATAIRE"
                )
            else:
                cit_model.ajouter_citoyen(
                    u.nom.upper(), u.prenom or "", u.date_naissance or "2000-01-01",
                    u.lieu_naissance or "Inconnu", True, "M", u.numero_cin or "N/A",
                    u.id_localite, u.profession, u.adresse, id_pere, id_mere, u.situation_matrimoniale or "CÉLIBATAIRE"
                )
                new_cit_id = cit_model.conn.execute_query("SELECT LAST_INSERT_ID()")[0][0]
                model.modifier_utilisateur(id_utilisateur, id_citoyen=new_cit_id)
            
        return {"message": "Profil et hiérarchie familiale mis à jour"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
