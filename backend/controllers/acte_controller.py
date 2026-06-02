from datetime import date
from typing import Optional, List, Dict, Any
from fastapi import HTTPException
from models.acte import Acte
from pydantic import BaseModel

class ActeSchema(BaseModel):
    type_acte: str
    date_acte: date
    numero_registre: str
    id_citoyen: Optional[int] = None

class ActeController:
    def __init__(self):
        self.modele_acte = Acte()

    def _tuple_to_dict(self, a: tuple) -> Dict[str, Any]:
        return {
            "id_acte": a[0],
            "type_acte": a[1],
            "date_acte": str(a[2]),
            "numero_registre": a[3],
            "date_registrement": str(a[4]) if len(a) > 4 else None,
            "id_citoyen": a[5] if len(a) > 5 else None
        }

    def create_acte(self, data: ActeSchema):
        try:
            print(f"DEBUG: Réception de données pour création d'acte: {data}")
            self.modele_acte.ajouter_acte(
                data.type_acte,
                data.date_acte,
                data.numero_registre,
                date.today(),
                data.id_citoyen
            )
            return {"status": "success", "message": "Acte ajouté"}
        except Exception as e:
            print(f"DEBUG: Erreur lors de la création d'acte: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    def list_all(self, id_localite: Optional[int] = None):
        if id_localite:
            res = self.modele_acte.lister_par_localite(id_localite)
        else:
            res = self.modele_acte.lister_tout()
        return [self._tuple_to_dict(r) for r in res]

    def list_by_citoyen(self, id_citoyen: int):
        res = self.modele_acte.lister_par_citoyen(id_citoyen)
        return [self._tuple_to_dict(r) for r in res]

    def get_acte(self, id_acte: int):
        res = self.modele_acte.obtenir_acte(id_acte)
        if res: return self._tuple_to_dict(res)
        raise HTTPException(status_code=404, detail="Acte non trouvé")

    def update_acte(self, id_acte: int, data: ActeSchema):
        try:
            self.modele_acte.modifier_acte(
                id_acte, data.type_acte, data.date_acte, data.numero_registre, date.today()
            )
            return {"status": "success", "message": "Acte mis à jour"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    def delete_acte(self, id_acte: int):
        try:
            self.modele_acte.supprimer_acte(id_acte)
            return {"status": "success", "message": "Acte supprimé"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
