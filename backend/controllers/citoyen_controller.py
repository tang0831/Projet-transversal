from datetime import date
from typing import Optional

from connexion_base import ConnexionBase
from fastapi import HTTPException
from backend.models.citoyen import Citoyen


# Schéma Pydantic pour valider les données entrantes
class CitoyenSchema(ConnexionBase):
    nom: str
    prenom: str
    date_naissance: date
    lieu_naissance: str
    est_vivant: bool
    sexe: str
    numero_cin: str
    date_registrement: Optional[date] = date.today()


class CitoyenController:
    def __init__(self):
        # On initialise le modèle avec des valeurs vides
        self.modele_citoyen = Citoyen(None, None, None, None, None, None, None)

    def create_citoyen(self, data: CitoyenSchema):
        """Logique pour ajouter un citoyen"""
        try:
            self.modele_citoyen.ajouter_citoyen(
                data.nom,
                data.prenom,
                data.date_naissance,
                data.lieu_naissance,
                data.est_vivant,
                data.sexe,
                data.numero_cin,
            )
            return {
                "status": "success",
                "message": "Acte enregistré avec succès dans MySQL",
            }
        except Exception as e:
            raise HTTPException(
                status_code=500, detail=f"Erreur lors de la création : {str(e)}"
            )

    def get_citoyen(self, id_citoyen: int):
        """Logique pour récupérer un citoyen spécifique"""
        try:
            self.modele_citoyen.obtenir_citoyen(id_citoyen)

            if (
                hasattr(self.modele_citoyen, "id_citoyen")
                and self.modele_citoyen.id_citoyen is not None
            ):
                return {
                    "id": self.modele_citoyen.id_citoyen,
                    "nom": self.modele_citoyen.nom,
                    "prenom": self.modele_citoyen.prenom,
                    "date_naissance": self.modele_citoyen.date_naissance,
                    "lieu_naissance": self.modele_citoyen.lieu_naissance,
                    "est_vivant": self.modele_citoyen.est_vivant,
                    "sexe": self.modele_citoyen.sexe,
                    "numero_cin": self.modele_citoyen.numero_cin,
                }
            else:
                raise HTTPException(status_code=404, detail="Acte non trouvé")
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    def update_citoyen(self, id_citoyen: int, data: CitoyenSchema):
        """Logique pour modifier un citoyen"""
        try:
            # On vérifie d'abord si l'acte existe
            self.modele_citoyen.obtenir_citoyen(id_citoyen)
            if not hasattr(self.modele_citoyen, "id_citoyen"):
                raise HTTPException(
                    status_code=404, detail="Acte introuvable pour modification"
                )

            self.modele_citoyen.modifier_citoyen(
                id_citoyen,
                data.nom,
                data.prenom,
                data.date_naissance,
                data.lieu_naissance,
                data.est_vivant,
                data.sexe,
                data.numero_cin,
            )
            return {"status": "success", "message": f"Citoyen {id_citoyen} mis à jour"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    def delete_acte(self, id_citoyen: int):
        """Logique pour supprimer un acte"""
        try:
            self.modele_citoyen.supprimer_citoyen(id_citoyen)
            return {"status": "success", "message": f"Citoyen {id_citoyen} supprimé"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
