from connexion_base import ConnexionBase


class Citoyen:
    # 1. On rend TOUS les paramètres optionnels avec =None
    def __init__(
        self,
        nom=None,
        prenom=None,
        date_naissance=None,
        lieu_naissance=None,
        est_vivant=True,
        sexe=None,
        numero_cin=None,
        id_localite=None,
    ):
        self.nom = nom
        self.prenom = prenom
        self.date_naissance = date_naissance
        self.lieu_naissance = lieu_naissance
        self.est_vivant = est_vivant
        self.sexe = sexe
        self.numero_cin = numero_cin
        self.id_localite = id_localite
        self.conn = ConnexionBase()
        self.conn.connect()

    def ajouter_citoyen(
        self,
        nom,
        prenom,
        date_naissance,
        lieu_naissance,
        est_vivant,
        sexe,
        numero_cin,
        id_localite=None,
    ):
        try:
            # 2. Remplacement des '?' par '%s' pour MySQL
            query = """INSERT INTO Citoyen (nom, prenom, date_naissance, lieu_naissance, est_vivant, sexe, numero_cin, id_localite)
                       VALUES (%s, %s, %s, %s, %s, %s, %s, %s)"""
            values = (
                nom,
                prenom,
                date_naissance,
                lieu_naissance,
                est_vivant,
                sexe,
                numero_cin,
                id_localite,
            )

            self.conn.execute_query(query, values)
            print(" Citoyen ajouté avec succès")

        except Exception as e:
            print(f"Erreur lors de l'ajout du citoyen ❌ : {e}")

    def lister_par_region(self, region):
        try:
            query = """
                SELECT c.* FROM Citoyen c
                JOIN localite l ON c.id_localite = l.id_localite
                WHERE l.region = %s
            """
            return self.conn.execute_query(query, (region,))
        except Exception as e:
            print(f"❌ Erreur lors de la récupération des citoyens par région : {e}")
            return []

    def modifier_citoyen(
        self,
        id_citoyen,
        nom,
        prenom,
        date_naissance,
        lieu_naissance,
        est_vivant,
        sexe,
        numero_cin,
        id_localite=None,
    ):
        try:
            # 2. Remplacement des '?' par '%s'
            query = """UPDATE Citoyen SET nom=%s, prenom=%s, date_naissance=%s, lieu_naissance=%s,
                       est_vivant=%s, sexe=%s, numero_cin=%s, id_localite=%s WHERE id_citoyen=%s"""
            values = (
                nom,
                prenom,
                date_naissance,
                lieu_naissance,
                est_vivant,
                sexe,
                numero_cin,
                id_localite,
                id_citoyen,
            )

            self.conn.execute_query(query, values)
            print(" Citoyen modifié avec succès")

        except Exception as e:
            print(f"Erreur lors de la modification du citoyen ❌ : {e}")

    def supprimer_citoyen(self, id_citoyen):
        try:
            query = "DELETE FROM Citoyen WHERE id_citoyen = %s"
            self.conn.execute_query(query, (id_citoyen,))
            print(" Citoyen supprimé avec succès")
        except Exception as e:
            print(f"Erreur lors de la suppression du citoyen ❌ : {e}")

    def lister_tout(self):
        try:
            query = "SELECT * FROM Citoyen"
            return self.conn.execute_query(query)
        except Exception as e:
            print(f"❌ Erreur lors de la récupération des citoyens : {e}")
            return []

    def obtenir_citoyen(self, id_citoyen):
        try:
            query = "SELECT * FROM Citoyen WHERE id_citoyen = %s"
            result = self.conn.execute_query(query, (id_citoyen,))

            if result:
                citoyen = result[0]
                self.id_citoyen = citoyen[0]
                self.nom = citoyen[1]
                self.prenom = citoyen[2]
                self.date_naissance = citoyen[3]
                self.lieu_naissance = citoyen[4]
                self.est_vivant = citoyen[5]
                self.sexe = citoyen[6]
                self.numero_cin = citoyen[7]
                self.id_localite = citoyen[8]
                print("Citoyen récupéré avec succès")
                return result[0]
            else:
                print("⚠️ Aucun citoyen trouvé")
                return None
        except Exception as e:
            print(f"Erreur lors de la récupération du citoyen : {e}")

    def marquer_comme_decede(self, id_citoyen):
        try:
            query = "UPDATE Citoyen SET est_vivant = 0 WHERE id_citoyen = %s"
            self.conn.execute_query(query, (id_citoyen,))
            print(f"✅ Citoyen ID {id_citoyen} marqué comme décédé.")
        except Exception as e:
            print(f"❌ Erreur lors de la mise à jour du statut : {e}")
