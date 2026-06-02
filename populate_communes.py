import csv
import requests
import mysql.connector

def update_communes():
    # Configuration de la base de données
    config = {
        "host": "localhost",
        "user": "root",
        "password": "fanambybisous",
        "database": "Etat_civil",
        "ssl_disabled": True
    }
    
    csv_url = "https://raw.githubusercontent.com/raherygino/madagascar-data/master/data.csv"
    
    try:
        print("Téléchargement des données...")
        response = requests.get(csv_url)
        response.raise_for_status()
        
        lines = response.text.strip().split('\n')
        reader = csv.DictReader(lines, delimiter=';')
        
        # On utilise un set pour éviter les doublons au niveau commune/district/region
        communes_set = set()
        for row in reader:
            # Structure du CSV : fokontany;Kaomina;Distrika;Region;Province
            # On veut uniquement les communes uniques
            # On retire les guillemets si présents
            region = row['Region'].strip('"')
            district = row['Distrika'].strip('"')
            commune = row['Kaomina'].strip('"')
            communes_set.add((region, district, commune))
        
        print(f"Nombre de communes uniques trouvées : {len(communes_set)}")
        
        conn = mysql.connector.connect(**config)
        cursor = conn.cursor()
        
        query = "INSERT INTO localite (region, district, nom_commune) VALUES (%s, %s, %s)"
        
        data_to_insert = sorted(list(communes_set))
        batch_size = 100
        for i in range(0, len(data_to_insert), batch_size):
            batch = data_to_insert[i:i + batch_size]
            cursor.executemany(query, batch)
            conn.commit()
            print(f"Inséré : {min(i + batch_size, len(data_to_insert))}/{len(data_to_insert)}")
        
        print(f"Succès : {len(data_to_insert)} communes insérées au total.")
        
    except Exception as e:
        print(f"Erreur : {e}")
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

if __name__ == "__main__":
    update_communes()
