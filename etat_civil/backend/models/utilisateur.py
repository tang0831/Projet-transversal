from connexion_base import ConnexionBase


class Utilisateur:
    def __init__(self, nom=None, mot_de_passe=None, role=None, id_utilisateur=None):
        self.id_utilisateur = id_utilisateur
        self.nom = nom
        self.mot_de_passe = mot_de_passe
        self.role = role
        self.conn = ConnexionBase()
        self.conn.connect()

    def ajouter_utilisateur(self, nom, mot_de_passe, role):
        try:
            query = (
                "INSERT INTO utilisateur (nom, mot_de_passe, role) VALUES (%s, %s, %s)"
            )
            values = (nom, mot_de_passe, role)
            self.conn.execute_query(query, values)
            print("Utilisateur ajouté avec succès")
        except Exception as e:
            print(f"Erreur lors de l'ajout : {e}")

    def modifier_utilisateur(self, id_utilisateur, nom, mot_de_passe, role):
        try:
            # On utilise l'ID passé en paramètre pour savoir qui modifier
            query = "UPDATE utilisateur SET nom = %s, mot_de_passe = %s, role = %s WHERE id_utilisateur = %s"
            values = (nom, mot_de_passe, role, id_utilisateur)
            self.conn.execute_query(query, values)
            print("Utilisateur modifié avec succès")
        except Exception as e:
            print(f"Erreur lors de la modification : {e}")

    def supprimer_utilisateur(self, id_utilisateur):
        try:
            query = "DELETE FROM utilisateur WHERE id_utilisateur = %s"
            values = (id_utilisateur,)
            self.conn.execute_query(query, values)
            print("Utilisateur supprimé avec succès")
        except Exception as e:
            print(f"Erreur lors de la suppression : {e}")

    def obtenir_utilisateur(self, id_utilisateur):
        try:
            query = "SELECT * FROM utilisateur WHERE id_utilisateur = %s"
            values = (id_utilisateur,)
            result = self.conn.execute_query(query, values)

            if result:
                user_data = result[0]
                # On met à jour les attributs de l'objet avec les données de la base
                self.id_utilisateur = user_data[0]
                self.nom = user_data[1]
                self.mot_de_passe = user_data[2]
                self.role = user_data[3]
                return user_data
            else:
                print("Aucun utilisateur trouvé")
                return None
        except Exception as e:
            print(f"Erreur lors de la récupération : {e}")

    def verifier_identifiants(self, nom, mot_de_passe):
        try:
            query = "SELECT * FROM utilisateur WHERE nom = %s AND mot_de_passe = %s"
            result = self.conn.execute_query(query, (nom, mot_de_passe))
            if result:
                return result[0]
            return None
        except Exception as e:
            print(f"Erreur lors de la vérification : {e}")
            return None

    def lister_tout(self):
        try:
            query = "SELECT * FROM utilisateur"
            return self.conn.execute_query(query)
        except Exception as e:
            print(f"❌ Erreur lors de la récupération des utilisateurs : {e}")
            return []
