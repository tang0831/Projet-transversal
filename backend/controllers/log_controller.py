from fastapi import HTTPException
from models.systeme_log import SystemeLog

class LogController:
    def __init__(self):
        self.modele_log = SystemeLog()

    def get_all_logs(self):
        try:
            # On va ajouter une méthode lister_tout dans systeme_log.py si elle manque
            query = "SELECT * FROM systeme_log ORDER BY date_log DESC"
            res = self.modele_log.conn.execute_query(query)
            return [
                {
                    "id": l[0],
                    "action": l[1],
                    "details": l[2],
                    "date": l[3]
                } for l in res
            ]
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
