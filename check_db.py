from connexion_base import ConnexionBase
db = ConnexionBase()
db.connect()
cursor = db.conn.cursor()
cursor.execute("DESCRIBE Citoyen")
for row in cursor.fetchall():
    print(row)
