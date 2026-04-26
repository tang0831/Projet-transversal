from connexion_base import ConnexionBase


class Acte:
    def __init__(
        self,
        type_acte=None,
        date_acte=None,
        numero_registre=None,
        date_registrement=None,
    ):
        self.type_acte = type_acte
        self.date_acte = date_acte
        self.numero_registre = numero_registre
        self.date_registrement = date_registrement
        self.conn = ConnexionBase()
        self.conn.connect()

    def ajouter_acte(self, type_acte, date_acte, numero_registre, date_registrement):
        try:
            query = "INSERT INTO acte (type_acte, date_acte, numero_registre, date_registrement) VALUES (%s, %s, %s, %s)"
            values = (type_acte, date_acte, numero_registre, date_registrement)
            self.conn.execute_query(query, values)
            print(" Acte ajouté avec succès")
        except Exception as e:
            print(f"❌ Erreur lors de l'ajout de l'acte : {e}")

    def obtenir_acte(self, id_acte):
        try:
            # Vérifie bien que ta colonne s'appelle id_acte dans MySQL
            query = "SELECT * FROM acte WHERE id_acte = %s"
            result = self.conn.execute_query(query, (id_acte,))
            if result:
                data = result[0]
                self.id_acte = data[0]
                self.type_acte = data[1]
                self.date_acte = data[2]
                self.numero_registre = data[3]
                self.date_registrement = data[4]
                print("Acte récupéré avec succès")
                return data
            else:
                print("⚠️ Aucun acte trouvé")
                return None
        except Exception as e:
            print(f"❌ Erreur lors de la récupération de l'acte : {e}")

    def modifier_acte(
        self, id_acte, type_acte, date_acte, numero_registre, date_registrement
    ):
        try:
            query = "UPDATE acte SET type_acte = %s, date_acte = %s, numero_registre = %s, date_registrement = %s WHERE id_acte = %s"
            values = (type_acte, date_acte, numero_registre, date_registrement, id_acte)
            self.conn.execute_query(query, values)
            print("Acte modifié avec succès")
        except Exception as e:
            print(f"❌ Erreur lors de la modification de l'acte : {e}")

    def supprimer_acte(self, id_acte):
        try:
            query = "DELETE FROM acte WHERE id_acte = %s"
            self.conn.execute_query(query, (id_acte,))
            print("Acte supprimé avec succès")
        except Exception as e:
            print(f"❌ Erreur lors de la suppression de l'acte : {e}")

    def lister_tout(self):
        try:
            query = "SELECT * FROM acte"
            return self.conn.execute_query(query)
        except Exception as e:
            print(f"❌ Erreur lors de la récupération des actes : {e}")
            return []
