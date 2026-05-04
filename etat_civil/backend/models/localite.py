from connexion_base import ConnexionBase


class Localite:
    # On met les paramètres à None par défaut pour pouvoir faire loc = Localite()
    def __init__(self, nom_commune=None, district=None, region=None, code_postal=None):
        self.nom_commune = nom_commune
        self.district = district
        self.region = region
        self.code_postal = code_postal
        self.conn = ConnexionBase()
        self.conn.connect()

    def ajouter_localite(self, nom_commune, district, region, code_postal):
        try:
            # Utilisation de %s pour MySQL
            query = """INSERT INTO localite (nom_commune, district, region, code_postal)
                       VALUES (%s, %s, %s, %s)"""
            values = (nom_commune, district, region, code_postal)

            self.conn.execute_query(query, values)
            print("Localité ajoutée avec succès")
        except Exception as e:
            print(f"❌ Erreur lors de l'ajout de la localité : {e}")

    def modifier_localite(
        self, id_localite, nom_commune, district, region, code_postal
    ):
        try:
            query = """UPDATE localite SET nom_commune = %s, district = %s, region = %s, code_postal = %s
                       WHERE id_localite = %s"""
            values = (nom_commune, district, region, code_postal, id_localite)

            self.conn.execute_query(query, values)
            print("✅ Localité modifiée avec succès")
        except Exception as e:
            print(f"❌ Erreur lors de la modification : {e}")

    def obtenir_localite(self, id_localite):
        try:
            query = "SELECT * FROM localite WHERE id_localite = %s"
            result = self.conn.execute_query(query, (id_localite,))

            if result:
                localite = result[0]
                # Selon si execute_query renvoie un tuple ou un dict
                self.id_localite = localite[0]
                self.nom_commune = localite[1]
                self.district = localite[2]
                self.region = localite[3]
                self.code_postal = localite[4]
                print(" Localité récupérée avec succès")
                return result[0]
            else:
                print("Aucune localité trouvée")
                return None
        except Exception as e:
            print(f"❌ Erreur lors de la récupération : {e}")

    def lister_tout(self):
        try:
            query = "SELECT * FROM localite"
            return self.conn.execute_query(query)
        except Exception as e:
            print(f"❌ Erreur lors de la récupération des localités : {e}")
            return []

    def supprimer_localite(self, id_localite):
        try:
            query = "DELETE FROM localite WHERE id_localite = %s"
            self.conn.execute_query(query, (id_localite,))
            print(" Localité supprimée avec succès")
        except Exception as e:
            print(f"❌ Erreur lors de la suppression : {e}")
