from fastapi import HTTPException
from pydantic import BaseModel
from typing import Optional
from models.forum import ForumModel, DemandeActeModel
from connexion_base import ConnexionBase

class MessageSchema(BaseModel):
    id_utilisateur: int
    contenu: str

class DemandeSchema(BaseModel):
    id_utilisateur: int
    type_acte: str

class StatutDemandeSchema(BaseModel):
    statut: str

class PrivateMessageSchema(BaseModel):
    id_expediteur: int
    id_destinataire: int
    contenu: str
    fichier_url: Optional[str] = None

class ForumController:
    def __init__(self):
        self.forum_model = ForumModel()
        self.demande_model = DemandeActeModel()
        self.conn = ConnexionBase()

    def get_messages(self, district: Optional[str] = None):
        try:
            if not district:
                return []
            res = self.forum_model.lister_messages_par_district(district)
            return [
                {
                    "id": m[0],
                    "contenu": m[1],
                    "date": str(m[2]),
                    "username": m[3],
                    "role": m[4]
                } for m in res
            ]
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    def post_message(self, data: MessageSchema):
        try:
            self.forum_model.ajouter_message(data.id_utilisateur, data.contenu)
            return {"status": "success", "message": "Message posté"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    def create_demande(self, data: DemandeSchema):
        try:
            self.demande_model.creer_demande(data.id_utilisateur, data.type_acte)
            return {"status": "success", "message": "Demande créée"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    def list_demandes(self):
        try:
            res = self.demande_model.lister_toutes()
            return [
                {
                    "id": d[0],
                    "type": d[1],
                    "statut": d[2],
                    "date": str(d[3]),
                    "nom_utilisateur": d[4],
                    "citoyen_nom": d[5],
                    "citoyen_prenom": d[6],
                    "citoyen_cin": d[7]
                } for d in res
            ]
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    def update_statut_demande(self, id_demande: int, data: StatutDemandeSchema):
        try:
            self.demande_model.mettre_a_jour_statut(id_demande, data.statut)
            return {"status": "success", "message": f"Statut demande {id_demande} mis à jour"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    def send_private_message(self, data: PrivateMessageSchema):
        try:
            query = "INSERT INTO private_message (id_expediteur, id_destinataire, contenu, fichier_url) VALUES (%s, %s, %s, %s)"
            self.conn.execute_query(query, (data.id_expediteur, data.id_destinataire, data.contenu, data.fichier_url))
            return {"status": "success", "message": "Message envoyé"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    def get_private_messages(self, id_utilisateur: int):
        try:
            query = """
                SELECT id_p_message, id_expediteur, id_destinataire, contenu, fichier_url, date_envoi
                FROM private_message
                WHERE id_expediteur = %s OR id_destinataire = %s
                ORDER BY date_envoi ASC
            """
            res = self.conn.execute_query(query, (id_utilisateur, id_utilisateur))
            return [
                {
                    "id": m[0],
                    "id_expediteur": m[1],
                    "id_destinataire": m[2],
                    "contenu": m[3],
                    "fichier_url": m[4],
                    "date": str(m[5])
                } for m in res
            ]
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

