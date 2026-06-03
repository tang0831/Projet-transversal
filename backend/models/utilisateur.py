from connexion_base import ConnexionBase

class Utilisateur:
    def __init__(self, nom=None, mot_de_passe=None, role=None, id_utilisateur=None, id_localite=None, photo=None, id_citoyen=None):
        self.id_utilisateur = id_utilisateur
        self.nom = nom
        self.mot_de_passe = mot_de_passe
        self.role = role
        self.id_localite = id_localite
        self.photo = photo
        self.id_citoyen = id_citoyen
        self.conn = ConnexionBase()

    def ajouter_utilisateur(self, nom, mot_de_passe, role, id_localite=None, photo=None, id_citoyen=None):
        try:
            query = "INSERT INTO utilisateur (nom, mot_de_passe, role, id_localite, photo, id_citoyen) VALUES (%s, %s, %s, %s, %s, %s)"
            values = (nom, mot_de_passe, role, id_localite, photo, id_citoyen)
            self.conn.execute_query(query, values)
        except Exception as e:
            print(f"Erreur ajout: {e}")
            raise e

    def modifier_utilisateur(self, id_utilisateur, **kwargs):
        """Mise à jour dynamique : seuls les champs fournis sont modifiés"""
        try:
            if not kwargs: return
            
            # Map frontend keys to DB keys if necessary
            mapping = {
                "username": "nom",
                "nom": "nom",
                "password": "mot_de_passe",
                "mot_de_passe": "mot_de_passe",
                "role": "role",
                "id_localite": "id_localite",
                "photo": "photo",
                "id_citoyen": "id_citoyen"
            }
            
            updates = []
            values = []
            for key, val in kwargs.items():
                if key in mapping:
                    updates.append(f"{mapping[key]} = %s")
                    values.append(val)
            
            if not updates: return
            
            query = f"UPDATE utilisateur SET {', '.join(updates)} WHERE id_utilisateur = %s"
            values.append(id_utilisateur)
            
            self.conn.execute_query(query, tuple(values))
        except Exception as e:
            print(f"Erreur modif: {e}")
            raise e

    def verifier_identifiants(self, nom, mot_de_passe):
        query = "SELECT * FROM utilisateur WHERE nom = %s AND mot_de_passe = %s"
        res = self.conn.execute_query(query, (nom, mot_de_passe))
        return res[0] if res else None

    def obtenir_utilisateur(self, id_user):
        query = "SELECT * FROM utilisateur WHERE id_utilisateur = %s"
        res = self.conn.execute_query(query, (id_user,))
        if res:
            u = res[0]
            self.id_utilisateur, self.nom, self.mot_de_passe, self.role = u[0], u[1], u[2], u[3]
            self.id_localite = u[4] if len(u) > 4 else None
            self.photo = u[5] if len(u) > 5 else None
            self.id_citoyen = u[6] if len(u) > 6 else None
            return u
        return None

    def lister_tout(self):
        return self.conn.execute_query("SELECT * FROM utilisateur")
