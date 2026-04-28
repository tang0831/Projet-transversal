import mysql.connector


class ConnexionBase:
    def __init__(self):
        self.config = {
            "host": "localhost",
            "user": "root",
            "password": "fanambybisous",
            "database": "Etat_civil",
        }
        self.conn = None

    def connect(self):
        if not self.conn or not self.conn.is_connected():
            self.conn = mysql.connector.connect(**self.config)

    def execute_query(self, query, values=None):
        self.connect()
        cursor = self.conn.cursor()
        try:
            cursor.execute(query, values)
            if query.strip().upper().startswith("SELECT"):
                return cursor.fetchall()
            else:
                self.conn.commit()
                return None
        finally:
            cursor.close()
