from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Request, Query, HTTPException
from fastapi.responses import Response
from typing import List, Optional
from datetime import datetime
from controllers.acte_controller import ActeController, ActeSchema
from controllers.citoyen_controller import CitoyenController, CitoyenSchema
from controllers.auth_controller import UtilisateurController, LoginSchema
from controllers.localite_controller import LocaliteController, LocaliteSchema
from controllers.forum_controller import ForumController, MessageSchema, DemandeSchema, StatutDemandeSchema, PrivateMessageSchema
from controllers.log_controller import LogController
from controllers.sync_controller import SyncController, SyncSchema
from utils.pdf_generator import generate_acte_pdf, generate_citoyens_pdf, generate_actes_pdf

app = FastAPI(title="Tokana ID API", version="1.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialisation des contrôleurs
acte_ctrl = ActeController()
citoyen_ctrl = CitoyenController()
user_ctrl = UtilisateurController()
loc_ctrl = LocaliteController()
forum_ctrl = ForumController()
log_ctrl = LogController()
sync_ctrl = SyncController()

@app.get("/")
def read_root(): return {"message": "API Tokana ID"}

# --- AUTHENTIFICATION & PROFIL ---
@app.post("/auth/login")
async def login(data: LoginSchema): return await user_ctrl.login(data)

@app.post("/auth/register")
async def register(request: Request): return await user_ctrl.register(request)

@app.get("/users/{id_user}")
async def get_user(id_user: int): return await user_ctrl.get_user(id_user)

@app.put("/utilisateurs/{id_user}")
async def update_user(id_user: int, request: Request): return await user_ctrl.update_user(id_user, request)

@app.post("/utilisateurs/")
async def create_user(request: Request): return await user_ctrl.create_user(request)

# --- ROUTES ACTES ---
@app.get("/actes")
def list_actes(id_localite: Optional[int] = Query(None)): 
    return acte_ctrl.list_all(id_localite)

@app.get("/actes/export/pdf")
def export_all_actes_pdf(id_localite: Optional[int] = Query(None)):
    actes = acte_ctrl.list_all(id_localite)
    pdf_content = generate_actes_pdf(actes)
    return Response(content=pdf_content, media_type="application/pdf", headers={"Content-Disposition": "attachment; filename=liste_actes.pdf"})

@app.get("/actes/citoyen/{id_citoyen}")
def list_my_actes(id_citoyen: int): return acte_ctrl.list_by_citoyen(id_citoyen)

@app.post("/actes")
def create_acte(data: ActeSchema): return acte_ctrl.create_acte(data)

@app.get("/actes/{id_acte}/pdf")
def export_acte_pdf(id_acte: int, user_id: Optional[int] = None):
    acte = acte_ctrl.get_acte(id_acte)
    citoyen = citoyen_ctrl.get_citoyen(acte['id_citoyen']) if acte.get('id_citoyen') else None
    
    # Récupérer le nom du demandeur si un user_id est fourni
    nom_demandeur = 'Administration'
    if user_id:
        user_data = user_ctrl.get_user(user_id)
        if user_data:
            nom_demandeur = user_data.get('nom', 'Utilisateur')
    
    # Préparation du dictionnaire pour le générateur de PDF
    data = {
        'faritany': 'TOAMASINA', 'faritra': 'ATSINANANA', 'distrika': 'MAHANORO', 'kaominina': 'MAHANORO',
        'numero_registre': acte['numero_registre'], 'annee_registre': acte['date_acte'].split('-')[0],
        'nom_enfant': citoyen['nom'] if citoyen else 'N/A', 'prenom_enfant': citoyen['prenom'] if citoyen else 'N/A',
        'sexe_enfant': 'Zazavavy', # Par défaut ou à ajouter dans le modèle
        'date_naissance': acte['date_acte'], 'heure_naissance': '08:00',
        'lieu_naissance': 'Mahanoro',
        'nom_pere': '...', 'prenom_pere': '...', 'profession_pere': '...', 'age_pere': '...',
        'nom_mere': '...', 'prenom_mere': '...', 'profession_mere': '...', 'age_mere': '...',
        'domicile_parents': 'Mahanoro',
        'nom_demandeur': nom_demandeur,
        'date_livraison': datetime.now().strftime("%d %B %Y"),
        'type_acte': acte['type_acte']
    }
    
    pdf_content = generate_acte_pdf(data)
    return Response(content=pdf_content, media_type="application/pdf", headers={"Content-Disposition": f"attachment; filename=acte_{id_acte}.pdf"})

@app.put("/actes/{id_acte}")
def update_acte(id_acte: int, data: ActeSchema): return acte_ctrl.update_acte(id_acte, data)

@app.delete("/actes/{id_acte}")
def delete_acte(id_acte: int): return acte_ctrl.delete_acte(id_acte)

# --- ROUTES CITOYENS ---
@app.get("/citoyens")
def list_citoyens(search: Optional[str] = None, id_localite: Optional[int] = Query(None)):
    if search:
        return citoyen_ctrl.search_citoyens(search, id_localite)
    return citoyen_ctrl.list_all(id_localite)

@app.get("/citoyens/export/pdf")
def export_citoyens_pdf(id_localite: Optional[int] = Query(None)):
    citoyens = citoyen_ctrl.list_all(id_localite)
    pdf_content = generate_citoyens_pdf(citoyens)
    return Response(content=pdf_content, media_type="application/pdf", headers={"Content-Disposition": "attachment; filename=liste_citoyens.pdf"})

@app.post("/citoyens")
def create_citoyen(data: CitoyenSchema): return citoyen_ctrl.create_citoyen(data)

@app.put("/citoyens/{id_citoyen}")
def update_citoyen(id_citoyen: int, data: CitoyenSchema): return citoyen_ctrl.update_citoyen(id_citoyen, data)

@app.delete("/citoyens/{id_citoyen}")
def delete_citoyen(id_citoyen: int): return citoyen_ctrl.delete_citoyen(id_citoyen)

# --- ROUTES LOCALITÉS ---
@app.get("/localites")
def list_localites(id_localite: Optional[int] = Query(None)): 
    return loc_ctrl.list_localites(id_localite)

@app.post("/localites")
def create_localite(data: LocaliteSchema): return loc_ctrl.create_localite(data)

@app.put("/localites/{id_localite}")
def update_localite(id_localite: int, data: LocaliteSchema): return loc_ctrl.update_localite(id_localite, data)

@app.delete("/localites/{id_localite}")
def delete_localite(id_localite: int): return loc_ctrl.delete_localite(id_localite)

# --- FORUM ---
@app.get("/forum/messages")
def get_messages(district: Optional[str] = None): return forum_ctrl.get_messages(district)

@app.post("/forum/messages")
def post_message(data: MessageSchema): return forum_ctrl.post_message(data)

@app.post("/messages/private")
def send_private_message(data: PrivateMessageSchema): return forum_ctrl.send_private_message(data)

@app.get("/messages/private/{id_user}")
def get_private_messages(id_user: int): return forum_ctrl.get_private_messages(id_user)

@app.get("/demandes")
def list_demandes(id_utilisateur: Optional[int] = None):
    if id_utilisateur:
        return forum_ctrl.demande_model.lister_par_utilisateur(id_utilisateur)
    return forum_ctrl.list_demandes()

@app.post("/demandes")
def create_demande(data: DemandeSchema): return forum_ctrl.create_demande(data)

@app.put("/demandes/{id_demande}")
def update_demande_statut(id_demande: int, data: StatutDemandeSchema): return forum_ctrl.update_statut_demande(id_demande, data)

# --- OPTIMISATION ---
from structures.knapsack import knapsack, get_selected_items
@app.get("/admin/optimize")
def optimize_deployment(capacity: int, weights: str, values: str):
    w_list = [int(x) for x in weights.split(',')]
    v_list = [int(x) for x in values.split(',')]
    n = len(w_list)
    return {"max_impact": knapsack(capacity, w_list, v_list, n), "selected_indices": get_selected_items(capacity, w_list, v_list, n)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
