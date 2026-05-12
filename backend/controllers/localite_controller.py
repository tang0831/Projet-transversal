from fastapi import HTTPException
from pydantic import BaseModel
from models.localite import Localite

class LocaliteSchema(BaseModel):
    nom_commune: str
    district: str
    region: str
    code_postal: str

class LocaliteController:
    def __init__(self):
        self.modele_localite = Localite()

    def create_localite(self, data: LocaliteSchema):
        try:
            self.modele_localite.ajouter_localite(
                data.nom_commune, data.district, data.region, data.code_postal
            )
            return {"status": "success", "message": "Localité ajoutée"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    def list_localites(self):
        try:
            res = self.modele_localite.lister_tout()
            return [
                {
                    "id_localite": l[0],
                    "nom_commune": l[1],
                    "district": l[2],
                    "region": l[3],
                    "code_postal": l[4]
                } for l in res
            ]
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    def update_localite(self, id_localite: int, data: LocaliteSchema):
        try:
            self.modele_localite.modifier_localite(
                id_localite, data.nom_commune, data.district, data.region, data.code_postal
            )
            return {"status": "success", "message": f"Localité {id_localite} modifiée"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    def delete_localite(self, id_localite: int):
        try:
            self.modele_localite.supprimer_localite(id_localite)
            return {"status": "success", "message": f"Localité {id_localite} supprimée"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
