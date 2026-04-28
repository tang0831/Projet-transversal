from connexion_base import ConnexionBase


class FileSynchronisation:
    def __init__(self, donnees_synchro, statut, priorite, date_creation):
        self.donnee_synchro = donnees_synchro
        self.statut = statut
        self.priorite = priorite
        self.date_creation = date_creation
        self.conn = ConnexionBase()
        self.conn.connect()

    def ajouter_file(self, donnees_synchro, statut, priorite, date_creation):
        try:
            self.donnee_synchro = donnees_synchro
            self.statut = statut
            self.priorite = priorite
            self.date_creation = date_creation

            query = "INSERT INTO files_synchro (donnees_synchro, statut, priorite, date_creation) VALUES (?, ?, ?, ?)"
            values = (donnees_synchro, statut, priorite, date_creation)

            self.conn.execute_query(query, values)

            print("Fichier synchronisé ajouté avec succès ")

        except Exception as e:
            print(f"Erreur lors de l'ajout d'un fichier synchronisé ❌ : {e}")

    def modifier_file(self, id_file, donnees_synchro, statut, priorite, date_creation):
        try:
            self.donnee_synchro = donnees_synchro
            self.statut = statut
            self.priorite = priorite
            self.date_creation = date_creation

            query = "UPDATE files_synchro SET donnees_synchro = ?, statut = ?, priorite = ?, date_creation = ? WHERE id = ?"
            values = (donnees_synchro, statut, priorite, date_creation, id_file)

            self.conn.execute_query(query, values)

            print("Fichier synchronisé modifié avec succès ")

        except Exception as e:
            print(f"Erreur lors de la modification d'un fichier synchronisé ❌ : {e}")

    def supprimer_file(self, id_file):
        try:
            query = "DELETE FROM files_synchro WHERE id = ?"
            values = (id_file,)

            self.conn.execute_query(query, values)

            print("Fichier synchronisé supprimé avec succès ")

        except Exception as e:
            print(f"Erreur lors de la suppression d'un fichier synchronisé ❌ : {e}")

    def obtenir_file(self, id_file):
        try:
            query = "SELECT * FROM files_synchro WHERE id = ?"
            values = (id_file,)
            result = self.conn.execute_query(query, values)

            if result:
                file = result[0]
                self.id = file[0]
                self.donnee_synchro = file[1]
                self.statut = file[2]
                self.priorite = file[3]
                self.date_creation = file[4]

                print("Fichier synchronisé récupéré avec succès")

            else:
                print("Aucun fichier synchronisé trouvé")

        except Exception as e:
            print(f"Erreur lors de la récupération du fichier synchronisé : {e}")
