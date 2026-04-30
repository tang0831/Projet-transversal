from fastapi import HTTPException, Request
from backend.models.utilisateur import Utilisateur


class UtilisateurController:
    def __init__(self):
        # On initialise le modèle (les arguments sont None par défaut dans le __init__ corrigé)
        self.modele_utilisateur = Utilisateur(None, None, None)

    async def create_user(self, request: Request):
        """Ajouter un utilisateur (POST)"""
        try:
            data = await request.json()

            # Vérification manuelle des champs
            if not all(k in data for k in ("nom", "mot_de_passe", "role")):
                raise HTTPException(
                    status_code=400,
                    detail="Données incomplètes (nom, mot_de_passe, role requis)",
                )

            self.modele_utilisateur.ajouter_utilisateur(
                data["nom"], data["mot_de_passe"], data["role"]
            )
            return {"status": "success", "message": f"Utilisateur {data['nom']} créé"}

        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    async def get_user(self, id_utilisateur: int):
        """Récupérer un utilisateur par son ID (GET)"""
        try:
            res = self.modele_utilisateur.obtenir_utilisateur(id_utilisateur)
            if res:
                return {
                    "id": id_utilisateur,
                    "nom": self.modele_utilisateur.nom,
                    "role": self.modele_utilisateur.role,
                }
            raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    async def update_user(self, id_utilisateur: int, request: Request):
        """Modifier un utilisateur (PUT)"""
        try:
            data = await request.json()
            self.modele_utilisateur.modifier_utilisateur(
                id_utilisateur,
                data.get("nom"),
                data.get("mot_de_passe"),
                data.get("role"),
            )
            return {
                "status": "success",
                "message": f"Utilisateur {id_utilisateur} mis à jour",
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    async def delete_user(self, id_utilisateur: int):
        """Supprimer un utilisateur (DELETE)"""
        try:
            self.modele_utilisateur.supprimer_utilisateur(id_utilisateur)
            return {
                "status": "success",
                "message": f"Utilisateur {id_utilisateur} supprimé",
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
