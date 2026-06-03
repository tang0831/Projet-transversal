import requests

BASE_URL = "http://localhost:8000"
ID_MAHANORO = 27

def create_citizen(nom, prenom, cin, pere_id=None, mere_id=None):
    data = {
        "nom": nom,
        "prenom": prenom,
        "date_naissance": "2000-01-01",
        "lieu_naissance": "Mahanoro",
        "est_vivant": True,
        "sexe": "M" if nom == "RAKOTO" else "F",
        "numero_cin": cin,
        "id_localite": ID_MAHANORO
    }
    if pere_id: data["id_pere"] = pere_id
    if mere_id: data["id_mere"] = mere_id
    return requests.post(f"{BASE_URL}/citoyens", json=data)

def create_user(username, role="CITOYEN"):
    return requests.post(f"{BASE_URL}/auth/register", json={
        "username": username,
        "password": "Mahanoro2026",
        "role": role,
        "id_localite": ID_MAHANORO
    })

# Création des citoyens
print("Création des citoyens...")
create_citizen("RAKOTO", "Pierre", "101001000012") # ID 17
create_citizen("RASOA", "Marie", "101001000013")   # ID 18
create_citizen("RAKOTO", "Jean", "101001000011", 17, 18) # ID 16

create_citizen("RANDRIA", "Paul", "101001000015") # ID 20
create_citizen("BAKOLY", "Léa", "101001000016")   # ID 21
create_citizen("MIALY", "Sara", "101001000014", 20, 21)  # ID 19

# Création des comptes
print("Création des comptes...")
users = ["jean_rakoto", "pierre_rakoto", "marie_rasoa", "sara_mialy", "paul_randria", "lea_bakoly", "agent_mahanoro_2026"]
for u in users:
    role = "AGENT" if "agent" in u else "CITOYEN"
    create_user(u, role)

print("Setup complet.")
