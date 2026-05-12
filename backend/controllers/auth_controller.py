from fastapi import HTTPException, Request
from pydantic import BaseModel
from typing import Optional
from models.utilisateur import Utilisateur
from models.localite import Localite

class LoginSchema(BaseModel):
    username: str
    password: str

class UtilisateurController:
    def __init__(self):
        self.modele_utilisateur = Utilisateur()

    async def login(self, data: LoginSchema):
        try:
            user = self.modele_utilisateur.verifier_identifiants(data.username, data.password)
            if user:
                id_localite = user[4] if len(user) > 4 else None
                photo = user[5] if len(user) > 5 else None
                district, region = None, None
                
                if id_localite:
                    loc_data = Localite().obtenir_localite(id_localite)
                    if loc_data:
                        district, region = loc_data[2], loc_data[3]

                return {
                    "id_utilisateur": user[0],
                    "username": user[1],
                    "role": user[3],
                    "id_localite": id_localite,
                    "district": district,
                    "region": region,
                    "photo": photo
                }
            raise HTTPException(status_code=401, detail="Identifiants invalides")
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    async def create_user(self, request: Request):
        try:
            data = await request.json()
            nom = data.get("nom")
            pwd = data.get("mot_de_passe")
            role = data.get("role")
            if not nom or not pwd or not role:
                raise HTTPException(status_code=400, detail="Champs obligatoires manquants")

            self.modele_utilisateur.ajouter_utilisateur(nom, pwd, role, data.get("id_localite"), data.get("photo"))
            return {"status": "success", "message": "Utilisateur créé"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    async def update_user(self, id_utilisateur: int, request: Request):
        """Mise à jour du profil avec gestion dynamique des champs"""
        try:
            data = await request.json()
            # On retire les champs qui ne doivent pas être modifiés par l'utilisateur ou qui sont vides
            filtered_data = {k: v for k, v in data.items() if v is not None and k != "id_utilisateur"}
            
            self.modele_utilisateur.modifier_utilisateur(id_utilisateur, **filtered_data)
            return {"status": "success", "message": "Profil mis à jour"}
        except Exception as e:
            print(f"Erreur controller update: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    async def get_user(self, id_user: int):
        res = self.modele_utilisateur.obtenir_utilisateur(id_user)
        if res:
            return {"id": res[0], "nom": res[1], "role": res[3], "photo": res[5] if len(res) > 5 else None}
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
