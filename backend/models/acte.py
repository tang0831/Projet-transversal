from connexion_base import ConnexionBase


class Acte:
    def __init__(
        self,
        type_acte=None,
        date_acte=None,
        numero_registre=None,
        date_registrement=None,
        id_citoyen=None,
    ):
        self.type_acte = type_acte
        self.date_acte = date_acte
        self.numero_registre = numero_registre
        self.date_registrement = date_registrement
        self.id_citoyen = id_citoyen
        self.conn = ConnexionBase()
        self.conn.connect()

    def ajouter_acte(
        self, type_acte, date_acte, numero_registre, date_registrement, id_citoyen=None, id_conjoint=None
    ):
        query = "INSERT INTO acte (type_acte, date_acte, numero_registre, date_registrement, id_citoyen, id_conjoint) VALUES (%s, %s, %s, %s, %s, %s)"
        values = (
            type_acte,
            date_acte,
            numero_registre,
            date_registrement,
            id_citoyen,
            id_conjoint,
        )
        result = self.conn.execute_query(query, values)
        if result is None:
            raise Exception("Erreur d'insertion dans la base de données")
        print(" Acte ajouté avec succès")

    def obtenir_acte_complet(self, id_acte):
        try:
            query = """
                SELECT a.*, 
                       c.nom, c.prenom, c.numero_cin, c.date_naissance, c.lieu_naissance, c.sexe, c.profession, c.adresse,
                       p.nom as nom_pere, p.prenom as prenom_pere, p.profession as profession_pere, p.date_naissance as date_nais_pere,
                       m.nom as nom_mere, m.prenom as prenom_mere, m.profession as profession_mere, m.date_naissance as date_nais_mere,
                       l.nom_commune, l.district, l.region,
                       conj.nom as nom_conj, conj.prenom as prenom_conj, conj.date_naissance as date_nais_conj, conj.lieu_naissance as lieu_nais_conj,
                       pp.nom as pere_conj, mm.nom as mere_conj
                FROM acte a
                LEFT JOIN Citoyen c ON a.id_citoyen = c.id_citoyen
                LEFT JOIN Citoyen p ON c.id_pere = p.id_citoyen
                LEFT JOIN Citoyen m ON c.id_mere = m.id_citoyen
                LEFT JOIN localite l ON c.id_localite = l.id_localite
                LEFT JOIN Citoyen conj ON a.id_conjoint = conj.id_citoyen
                LEFT JOIN Citoyen pp ON conj.id_pere = pp.id_citoyen
                LEFT JOIN Citoyen mm ON conj.id_mere = mm.id_citoyen
                WHERE a.id_acte = %s
            """
            result = self.conn.execute_query(query, (id_acte,))
            return result[0] if result else None
        except Exception as e:
            print(f"❌ Erreur lors de la récupération de l'acte complet : {e}")
            raise e

    def lister_par_region(self, region):
        try:
            query = """
                SELECT a.* FROM acte a
                JOIN Citoyen c ON a.id_citoyen = c.id_citoyen
                JOIN localite l ON c.id_localite = l.id_localite
                WHERE l.region = %s
            """
            return self.conn.execute_query(query, (region,))
        except Exception as e:
            print(f"❌ Erreur lors de la récupération des actes par région : {e}")
            raise e

    def lister_par_citoyen(self, id_citoyen):
        try:
            query = "SELECT * FROM acte WHERE id_citoyen = %s"
            return self.conn.execute_query(query, (id_citoyen,))
        except Exception as e:
            print(f"❌ Erreur lors de la récupération des actes du citoyen : {e}")
            raise e

    def obtenir_acte(self, id_acte):
        try:
            query = "SELECT * FROM acte WHERE id_acte = %s"
            result = self.conn.execute_query(query, (id_acte,))
            if result:
                data = result[0]
                self.id_acte = data[0]
                self.type_acte = data[1]
                self.date_acte = data[2]
                self.numero_registre = data[3]
                self.date_registrement = data[4]
                self.id_citoyen = data[5] if len(data) > 5 else None
                return data
            return None
        except Exception as e:
            print(f"❌ Erreur lors de la récupération de l'acte : {e}")
            raise e

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
            raise e

    def supprimer_acte(self, id_acte):
        try:
            query = "DELETE FROM acte WHERE id_acte = %s"
            self.conn.execute_query(query, (id_acte,))
            print("Acte supprimé avec succès")
        except Exception as e:
            print(f"❌ Erreur lors de la suppression de l'acte : {e}")
            raise e

    def supprimer_par_citoyen(self, id_citoyen):
        try:
            query = "DELETE FROM acte WHERE id_citoyen = %s"
            self.conn.execute_query(query, (id_citoyen,))
            print(f"Actes du citoyen {id_citoyen} supprimés")
        except Exception as e:
            print(f"❌ Erreur lors de la suppression des actes du citoyen : {e}")
            raise e

    def lister_tout(self):
        try:
            query = "SELECT * FROM acte"
            return self.conn.execute_query(query)
        except Exception as e:
            print(f"❌ Erreur lors de la récupération des actes : {e}")
            raise e

    def lister_par_localite(self, id_localite):
        try:
            query = """
                SELECT a.* FROM acte a
                JOIN Citoyen c ON a.id_citoyen = c.id_citoyen
                WHERE c.id_localite = %s
            """
            return self.conn.execute_query(query, (id_localite,))
        except Exception as e:
            print(f"❌ Erreur lors de la récupération des actes par localité : {e}")
            raise e
