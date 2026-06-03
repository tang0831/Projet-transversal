from connexion_base import ConnexionBase

def apply_fix():
    db = ConnexionBase()
    db.connect()
    cursor = db.conn.cursor()
    
    commands = [
        "ALTER TABLE Citoyen ADD COLUMN id_pere INT DEFAULT NULL, ADD CONSTRAINT fk_cit_pere FOREIGN KEY (id_pere) REFERENCES Citoyen(id_citoyen)",
        "ALTER TABLE Citoyen ADD COLUMN id_mere INT DEFAULT NULL, ADD CONSTRAINT fk_cit_mere FOREIGN KEY (id_mere) REFERENCES Citoyen(id_citoyen)",
        "ALTER TABLE Citoyen ADD COLUMN profession VARCHAR(100) DEFAULT NULL",
        "ALTER TABLE Citoyen ADD COLUMN adresse VARCHAR(255) DEFAULT NULL",
        "ALTER TABLE Citoyen ADD COLUMN situation_matrimoniale VARCHAR(50) DEFAULT 'CÉLIBATAIRE'"
    ]
    
    for cmd in commands:
        try:
            print(f"Executing: {cmd}")
            cursor.execute(cmd)
            db.conn.commit()
        except Exception as e:
            print(f"Error executing command: {e}")
            
    cursor.close()
    db.conn.close()

if __name__ == "__main__":
    apply_fix()
