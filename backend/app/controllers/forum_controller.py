from fastapi import APIRouter, HTTPException
from app.db.connection import get_db_connection
from pydantic import BaseModel

router = APIRouter()

class MessageSchema(BaseModel):
    message: str
    id_utilisateur: int

@router.get("/forum/messages")
def get_messages(id_localite: int):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        query = """
            SELECT m.*, u.nom_utilisateur 
            FROM forum_message m
            JOIN utilisateur u ON m.id_utilisateur = u.id
            WHERE u.id_localite = %s
            ORDER BY m.date_envoi DESC
        """
        cursor.execute(query, (id_localite,))
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

@router.post("/forum/messages")
def post_message(data: MessageSchema):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO forum_message (id_utilisateur, message) VALUES (%s, %s)",
            (data.id_utilisateur, data.message)
        )
        conn.commit()
        return {"message": "Message envoyé"}
    finally:
        cursor.close()
        conn.close()
