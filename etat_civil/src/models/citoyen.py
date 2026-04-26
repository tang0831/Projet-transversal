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
    ):
        self.nom = nom
        self.prenom = prenom
        self.date_naissance = date_naissance
        self.lieu_naissance = lieu_naissance
        self.est_vivant = est_vivant
        self.sexe = sexe
        self.numero_cin = numero_cin
        self.conn = ConnexionBase()
        self.conn.connect()

    def ajouter_citoyen(
        self, nom, prenom, date_naissance, lieu_naissance, est_vivant, sexe, numero_cin
    ):
        try:
            # 2. Remplacement des '?' par '%s' pour MySQL
            query = """INSERT INTO Citoyen (nom, prenom, date_naissance, lieu_naissance, est_vivant, sexe, numero_cin)
                       VALUES (%s, %s, %s, %s, %s, %s, %s)"""
            values = (
                nom,
                prenom,
                date_naissance,
                lieu_naissance,
                est_vivant,
                sexe,
                numero_cin,
            )

            self.conn.execute_query(query, values)
            print(" Citoyen ajouté avec succès")

        except Exception as e:
            print(f"Erreur lors de l'ajout du citoyen ❌ : {e}")

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
    ):
        try:
            # 2. Remplacement des '?' par '%s'
            query = """UPDATE Citoyen SET nom=%s, prenom=%s, date_naissance=%s, lieu_naissance=%s,
                       est_vivant=%s, sexe=%s, numero_cin=%s WHERE id_citoyen=%s"""
            values = (
                nom,
                prenom,
                date_naissance,
                lieu_naissance,
                est_vivant,
                sexe,
                numero_cin,
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
                print("✅ Citoyen récupéré avec succès")
                return result[0]
            else:
                print("⚠️ Aucun citoyen trouvé")
                return None
        except Exception as e:
            print(f"Erreur lors de la récupération du citoyen : {e}")
