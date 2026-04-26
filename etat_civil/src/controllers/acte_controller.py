from datetime import date
from typing import Optional

from connexion_base import ConnexionBase
from fastapi import HTTPException
from src.models.acte import Acte


# Schéma Pydantic pour valider les données entrantes
class ActeSchema(ConnexionBase):
    type_acte: str
    date_acte: date
    numero_registre: str
    date_registrement: Optional[date] = date.today()


class ActeController:
    def __init__(self):
        # On initialise le modèle avec des valeurs vides
        self.modele_acte = Acte(None, None, None, None)

    def create_acte(self, data: ActeSchema):
        """Logique pour ajouter un acte"""
        try:
            self.modele_acte.ajouter_acte(
                data.type_acte,
                data.date_acte,
                data.numero_registre,
                data.date_registrement,
            )
            return {
                "status": "success",
                "message": "Acte enregistré avec succès dans MySQL",
            }
        except Exception as e:
            raise HTTPException(
                status_code=500, detail=f"Erreur lors de la création : {str(e)}"
            )

    def get_acte(self, id_acte: int):
        """Logique pour récupérer un acte spécifique"""
        try:
            self.modele_acte.obtenir_acte(id_acte)

            # Vérification si l'acte a bien été trouvé et chargé dans l'objet
            if (
                hasattr(self.modele_acte, "id_acte")
                and self.modele_acte.id_acte is not None
            ):
                return {
                    "id": self.modele_acte.id_acte,
                    "type": self.modele_acte.type_acte,
                    "date_acte": self.modele_acte.date_acte,
                    "num_registre": self.modele_acte.numero_registre,
                    "date_enregistrement": self.modele_acte.date_registrement,
                }
            else:
                raise HTTPException(status_code=404, detail="Acte non trouvé")
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    def update_acte(self, id_acte: int, data: ActeSchema):
        """Logique pour modifier un acte"""
        try:
            # On vérifie d'abord si l'acte existe
            self.modele_acte.obtenir_acte(id_acte)
            if not hasattr(self.modele_acte, "id_acte"):
                raise HTTPException(
                    status_code=404, detail="Acte introuvable pour modification"
                )

            self.modele_acte.modifier_acte(
                id_acte, data.date_acte, data.numero_registre, data.date_registrement
            )
            return {"status": "success", "message": f"Acte {id_acte} mis à jour"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    def delete_acte(self, id_acte: int):
        """Logique pour supprimer un acte"""
        try:
            self.modele_acte.supprimer_acte(id_acte)
            return {"status": "success", "message": f"Acte {id_acte} supprimé"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
