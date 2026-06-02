import mysql.connector
from mysql.connector import Error


class ConnexionBase:
    def __init__(
        self,
        host="localhost",
        user="root",
        password="fanambybisous",
        database="Etat_civil",
    ):
        self.host = host
        self.user = user
        self.password = password
        self.database = database
        self.connection = None
        self.cursor = None

    def connect(self):
        """Établit la connexion à la base de données MySQL."""
        if self.connection is None or not self.connection.is_connected():
            try:
                self.connection = mysql.connector.connect(
                    host=self.host,
                    user=self.user,
                    password=self.password,
                    database=self.database,
                )
                self.cursor = self.connection.cursor()
            except Error as e:
                print(f"❌ Erreur lors de la connexion à MySQL : {e}")

    def execute_query(self, query, values=None):
        """Exécute une requête SQL (SELECT, INSERT, UPDATE, DELETE)."""
        self.connect()
        if not self.cursor:
            return None

        try:
            self.cursor.execute(query, values)

            # Si c'est un SELECT, on retourne les résultats
            if query.strip().upper().startswith("SELECT"):
                return self.cursor.fetchall()

            # Sinon (INSERT, UPDATE, DELETE), on valide les changements
            self.connection.commit()
            return self.cursor.rowcount

        except Error as e:
            print(f"❌ Erreur d'exécution de la requête : {e}")
            return None

    def close(self):
        """Ferme la connexion et le curseur."""
        if self.cursor:
            self.cursor.close()
        if self.connection and self.connection.is_connected():
            self.connection.close()
