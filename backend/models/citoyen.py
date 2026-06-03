from connexion_base import ConnexionBase


class Citoyen:
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
        profession=None,
        adresse=None,
        id_pere=None,
        id_mere=None,
        situation_matrimoniale='CÉLIBATAIRE',
    ):
        self.nom = nom
        self.prenom = prenom
        self.date_naissance = date_naissance
        self.lieu_naissance = lieu_naissance
        self.est_vivant = est_vivant
        self.sexe = sexe
        self.numero_cin = numero_cin
        self.id_localite = id_localite
        self.profession = profession
        self.adresse = adresse
        self.id_pere = id_pere
        self.id_mere = id_mere
        self.situation_matrimoniale = situation_matrimoniale
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
        profession=None,
        adresse=None,
        id_pere=None,
        id_mere=None,
        situation_matrimoniale='CÉLIBATAIRE',
    ):
        try:
            query = """INSERT INTO Citoyen (nom, prenom, date_naissance, lieu_naissance, est_vivant, sexe, numero_cin, id_localite, profession, adresse, id_pere, id_mere, situation_matrimoniale)
                       VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"""
            values = (
                nom,
                prenom,
                date_naissance,
                lieu_naissance,
                est_vivant,
                sexe,
                numero_cin,
                id_localite,
                profession,
                adresse,
                id_pere,
                id_mere,
                situation_matrimoniale,
            )

            self.conn.execute_query(query, values)
            print(" Citoyen ajouté avec succès")

        except Exception as e:
            print(f"Erreur lors de l'ajout du citoyen ❌ : {e}")
            raise e

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
            raise e

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
        profession=None,
        adresse=None,
        id_pere=None,
        id_mere=None,
        situation_matrimoniale='CÉLIBATAIRE',
    ):
        try:
            query = """UPDATE Citoyen SET nom=%s, prenom=%s, date_naissance=%s, lieu_naissance=%s,
                       est_vivant=%s, sexe=%s, numero_cin=%s, id_localite=%s, profession=%s, adresse=%s, id_pere=%s, id_mere=%s, situation_matrimoniale=%s WHERE id_citoyen=%s"""
            values = (
                nom,
                prenom,
                date_naissance,
                lieu_naissance,
                est_vivant,
                sexe,
                numero_cin,
                id_localite,
                profession,
                adresse,
                id_pere,
                id_mere,
                situation_matrimoniale,
                id_citoyen,
            )

            self.conn.execute_query(query, values)
            print(" Citoyen modifié avec succès")

        except Exception as e:
            print(f"Erreur lors de la modification du citoyen ❌ : {e}")
            raise e

    def supprimer_citoyen(self, id_citoyen):
        try:
            query = "DELETE FROM Citoyen WHERE id_citoyen = %s"
            self.conn.execute_query(query, (id_citoyen,))
            print(" Citoyen supprimé avec succès")
        except Exception as e:
            print(f"Erreur lors de la suppression du citoyen ❌ : {e}")
            raise e

    def lister_tout(self):
        try:
            query = "SELECT * FROM Citoyen"
            return self.conn.execute_query(query)
        except Exception as e:
            print(f"❌ Erreur lors de la récupération des citoyens : {e}")
            raise e

    def lister_par_localite(self, id_localite):
        try:
            query = "SELECT * FROM Citoyen WHERE id_localite = %s"
            return self.conn.execute_query(query, (id_localite,))
        except Exception as e:
            print(f"❌ Erreur lors de la récupération des citoyens par localité : {e}")
            raise e

    def obtenir_citoyen(self, id_citoyen):
        try:
            query = "SELECT * FROM Citoyen WHERE id_citoyen = %s"
            result = self.conn.execute_query(query, (id_citoyen,))

            if result:
                return result[0]
            return None
        except Exception as e:
            print(f"Erreur lors de la récupération du citoyen : {e}")
            raise e

    def marquer_comme_decede(self, id_citoyen):
        try:
            query = "UPDATE Citoyen SET est_vivant = 0 WHERE id_citoyen = %s"
            self.conn.execute_query(query, (id_citoyen,))
            print(f"✅ Citoyen ID {id_citoyen} marqué comme décédé.")
        except Exception as e:
            print(f"❌ Erreur lors de la mise à jour du statut : {e}")
            raise e

    def marquer_comme_marie(self, id_citoyen):
        try:
            query = "UPDATE Citoyen SET situation_matrimoniale = 'MARIÉ(E)' WHERE id_citoyen = %s"
            self.conn.execute_query(query, (id_citoyen,))
            print(f"✅ Citoyen ID {id_citoyen} marqué comme marié(e).")
        except Exception as e:
            print(f"❌ Erreur lors de la mise à jour du statut matrimonial : {e}")
            raise e

    def verifier_lien_familial(self, id_demandeur, id_concerne):
        """
        Vérifie si le demandeur est autorisé à demander l'acte du concerné.
        Autorisés : Parents, Enfants, Époux, Frères/Sœurs.
        """
        try:
            if id_demandeur == id_concerne:
                return True, "Lui-même"

            # 1. Récupérer les données des deux
            d = self.obtenir_citoyen(id_demandeur)
            c = self.obtenir_citoyen(id_concerne)
            if not d or not c:
                return False, "Citoyen non trouvé"

            # d = (id, cin, nom, prenom, nais, lieu, vivant, sexe, loc, prof, adr, pere, mere, sit)
            # Index : 0:id, 11:pere, 12:mere

            # 2. Parents / Enfants
            if c[11] == id_demandeur or c[12] == id_demandeur:
                return True, "Parent"
            if d[11] == id_concerne or d[12] == id_concerne:
                return True, "Enfant"

            # 3. Frères / Sœurs (partagent au moins un parent)
            if (c[11] and c[11] == d[11]) or (c[12] and c[12] == d[12]):
                return True, "Frère/Sœur"

            # 4. Époux (via la table acte de mariage ou situation_matrimoniale)
            query_mariage = """
                SELECT id_acte FROM acte 
                WHERE type_acte = 'MARIAGE' 
                AND ((id_citoyen = %s AND id_conjoint = %s) OR (id_citoyen = %s AND id_conjoint = %s))
            """
            res_m = self.conn.execute_query(query_mariage, (id_demandeur, id_concerne, id_concerne, id_demandeur))
            if res_m:
                return True, "Époux/Épouse"

            return False, "Aucun lien familial direct trouvé"
        except Exception as e:
            print(f"Erreur vérification lien : {e}")
            return False, str(e)
