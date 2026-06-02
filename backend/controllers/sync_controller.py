from fastapi import HTTPException
from pydantic import BaseModel
from models.file_synchronisation import FileSynchronisation
from datetime import datetime

class SyncSchema(BaseModel):
    donnees_synchro: str
    statut: str
    priorite: int

class SyncController:
    def __init__(self):
        # Initialisation avec des valeurs par défaut pour satisfaire le __init__ du modèle
        self.modele_sync = FileSynchronisation(None, None, None, None)

    def create_sync(self, data: SyncSchema):
        try:
            self.modele_sync.ajouter_file(
                data.donnees_synchro, data.statut, data.priorite, datetime.now()
            )
            return {"status": "success", "message": "Tâche de synchro ajoutée"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    def list_syncs(self):
        try:
            query = "SELECT * FROM files_synchro"
            res = self.modele_sync.conn.execute_query(query)
            return [
                {
                    "id": s[0],
                    "donnees": s[1],
                    "statut": s[2],
                    "priorite": s[3],
                    "date": s[4]
                } for s in res
            ]
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    def delete_sync(self, id_sync: int):
        try:
            self.modele_sync.supprimer_file(id_sync)
            return {"status": "success", "message": f"Tâche {id_sync} supprimée"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
