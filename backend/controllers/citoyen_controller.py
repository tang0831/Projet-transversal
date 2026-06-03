from datetime import date
from typing import Optional, List, Dict, Any
from connexion_base import ConnexionBase
from fastapi import HTTPException
from models.citoyen import Citoyen
from models.acte import Acte
from structures.boyer_moore import boyer_moore_search
from pydantic import BaseModel

class CitoyenSchema(BaseModel):
    nom: str
    prenom: str
    date_naissance: date
    lieu_naissance: str
    est_vivant: bool
    sexe: str
    numero_cin: str
    id_localite: Optional[int] = None
    profession: Optional[str] = None
    adresse: Optional[str] = None
    id_pere: Optional[int] = None
    id_mere: Optional[int] = None
    situation_matrimoniale: Optional[str] = 'CÉLIBATAIRE'

class CitoyenController:
    def __init__(self):
        self.modele_citoyen = Citoyen()
        self.modele_acte = Acte()

    def _tuple_to_dict(self, c: tuple) -> Dict[str, Any]:
        return {
            "id_citoyen": c[0],
            "numero_cin": c[1],
            "nom": c[2],
            "prenom": c[3],
            "date_naissance": str(c[4]) if c[4] else None,
            "lieu_naissance": c[5],
            "est_vivant": bool(c[6]),
            "sexe": c[7],
            "id_localite": c[8],
            "profession": c[9],
            "adresse": c[10],
            "id_pere": c[11],
            "id_mere": c[12],
            "situation_matrimoniale": c[13]
        }

    def list_all(self, id_localite: Optional[int] = None) -> List[Dict[str, Any]]:
        if id_localite:
            citoyens = self.modele_citoyen.lister_par_localite(id_localite)
        else:
            citoyens = self.modele_citoyen.lister_tout()
        return [self._tuple_to_dict(c) for c in citoyens]

    def create_citoyen(self, data: CitoyenSchema):
        try:
            self.modele_citoyen.ajouter_citoyen(
                data.nom.upper(),
                data.prenom,
                data.date_naissance,
                data.lieu_naissance,
                data.est_vivant,
                data.sexe,
                data.numero_cin,
                data.id_localite,
                data.profession,
                data.adresse,
                data.id_pere,
                data.id_mere,
                data.situation_matrimoniale
            )
            return {"status": "success", "message": "Citoyen enregistré avec succès"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    def search_citoyens(self, pattern: str, id_localite: Optional[int] = None) -> List[Dict[str, Any]]:
        try:
            if id_localite:
                citoyens = self.modele_citoyen.lister_par_localite(id_localite)
            else:
                citoyens = self.modele_citoyen.lister_tout()
            
            if not citoyens: return []
            
            pattern = pattern.upper()
            resultats = []
            for c in citoyens:
                if (c[2] and boyer_moore_search(c[2].upper(), pattern) != -1) or                    (c[3] and boyer_moore_search(c[3].upper(), pattern) != -1):
                    resultats.append(self._tuple_to_dict(c))
            return resultats
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    def get_citoyen(self, id_citoyen: int):
        try:
            res = self.modele_citoyen.obtenir_citoyen(id_citoyen)
            if res:
                return self._tuple_to_dict(res)
            raise HTTPException(status_code=404, detail="Citoyen non trouvé")
        except Exception as e:
            if isinstance(e, HTTPException): raise e
            raise HTTPException(status_code=500, detail=str(e))

    def update_citoyen(self, id_citoyen: int, data: CitoyenSchema):
        try:
            self.modele_citoyen.modifier_citoyen(
                id_citoyen,
                data.nom.upper(),
                data.prenom,
                data.date_naissance,
                data.lieu_naissance,
                data.est_vivant,
                data.sexe,
                data.numero_cin,
                data.id_localite,
                data.profession,
                data.adresse,
                data.id_pere,
                data.id_mere,
                data.situation_matrimoniale
            )
            return {"status": "success", "message": "Citoyen mis à jour"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    def delete_citoyen(self, id_citoyen: int):
        try:
            # On supprime d'abord les actes liés (cascade manuelle)
            self.modele_acte.supprimer_par_citoyen(id_citoyen)
            # Puis on supprime le citoyen
            self.modele_citoyen.supprimer_citoyen(id_citoyen)
            return {"status": "success", "message": "Citoyen et ses actes supprimés"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
