from connexion_base import ConnexionBase


class SystemeLog:
    def __init__(self, action=None, details=None, date_log=None):
        self.action = action
        self.details = details
        self.date_log = date_log
        self.conn = ConnexionBase()
        self.conn.connect()

    def ajouter_log(self, action, details, date_log):
        try:
            query = "INSERT INTO systeme_log (action, details, date_log) VALUES (%s, %s, %s)"
            values = (action, details, date_log)
            self.conn.execute_query(query, values)
            print("Log système enregistré")
        except Exception as e:
            print(f"❌ Erreur lors de l'enregistrement du log : {e}")

    def obtenir_log(self, id_log):
        try:
            query = "SELECT * FROM systeme_log WHERE id_log = %s"
            result = self.conn.execute_query(query, (id_log,))
            if result:
                data = result[0]
                self.id_log = data[0]
                self.action = data[1]
                self.details = data[2]
                self.date_log = data[3]
                return data
        except Exception as e:
            print(f"❌ Erreur récupération log : {e}")
