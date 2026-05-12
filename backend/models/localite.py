from connexion_base import ConnexionBase


class Localite:
    def __init__(self, nom_commune=None, district=None, region=None, code_postal=None):
        self.nom_commune = nom_commune
        self.district = district
        self.region = region
        self.code_postal = code_postal
        self.conn = ConnexionBase()
        self.conn.connect()

    def ajouter_localite(self, nom_commune, district, region, code_postal):
        try:
            query = """INSERT INTO localite (nom_commune, district, region, code_postal)
                       VALUES (%s, %s, %s, %s)"""
            values = (nom_commune, district, region, code_postal)
            self.conn.execute_query(query, values)
            print("Localité ajoutée avec succès")
        except Exception as e:
            print(f"❌ Erreur lors de l'ajout de la localité : {e}")
            raise e

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
            raise e

    def obtenir_localite(self, id_localite):
        try:
            query = "SELECT * FROM localite WHERE id_localite = %s"
            result = self.conn.execute_query(query, (id_localite,))
            return result[0] if result else None
        except Exception as e:
            print(f"❌ Erreur lors de la récupération : {e}")
            raise e

    def obtenir_region_par_id(self, id_localite):
        try:
            query = "SELECT region FROM localite WHERE id_localite = %s"
            result = self.conn.execute_query(query, (id_localite,))
            if result:
                return result[0][0]
            return None
        except Exception as e:
            print(f"❌ Erreur lors de la récupération de la région : {e}")
            raise e

    def lister_tout(self):
        try:
            query = "SELECT * FROM localite"
            return self.conn.execute_query(query)
        except Exception as e:
            print(f"❌ Erreur lors de la récupération des localités : {e}")
            raise e

    def lister_par_region(self, region):
        try:
            query = "SELECT * FROM localite WHERE region = %s"
            return self.conn.execute_query(query, (region,))
        except Exception as e:
            print(f"❌ Erreur lors de la récupération des localités par région : {e}")
            raise e

    def supprimer_localite(self, id_localite):
        try:
            query = "DELETE FROM localite WHERE id_localite = %s"
            self.conn.execute_query(query, (id_localite,))
            print(" Localité supprimée avec succès")
        except Exception as e:
            print(f"❌ Erreur lors de la suppression : {e}")
            raise e
