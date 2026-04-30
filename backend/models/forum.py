from connexion_base import ConnexionBase


class ForumModel:
    def __init__(self):
        self.conn = ConnexionBase()

    def ajouter_message(self, id_utilisateur, contenu):
        query = "INSERT INTO forum_message (id_utilisateur, contenu) VALUES (%s, %s)"
        self.conn.execute_query(query, (id_utilisateur, contenu))

    def lister_messages(self):
        query = """
            SELECT m.id_message, m.contenu, m.date_envoi, u.nom, u.role
            FROM forum_message m
            JOIN utilisateur u ON m.id_utilisateur = u.id_utilisateur
            ORDER BY m.date_envoi ASC
        """
        return self.conn.execute_query(query)


class DemandeActeModel:
    def __init__(self):
        self.conn = ConnexionBase()

    def creer_demande(self, id_utilisateur, type_acte):
        query = "INSERT INTO demande_acte (id_utilisateur, type_acte) VALUES (%s, %s)"
        self.conn.execute_query(query, (id_utilisateur, type_acte))

    def lister_toutes(self):
        query = """
            SELECT d.id_demande, d.type_acte, d.statut, d.date_demande, u.nom
            FROM demande_acte d
            JOIN utilisateur u ON d.id_utilisateur = u.id_utilisateur
            ORDER BY d.date_demande DESC
        """
        return self.conn.execute_query(query)

    def lister_par_utilisateur(self, id_utilisateur):
        query = "SELECT * FROM demande_acte WHERE id_utilisateur = %s ORDER BY date_demande DESC"
        return self.conn.execute_query(query, (id_utilisateur,))

    def mettre_a_jour_statut(self, id_demande, statut):
        query = "UPDATE demande_acte SET statut = %s WHERE id_demande = %s"
        self.conn.execute_query(query, (statut, id_demande))
