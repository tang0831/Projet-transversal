# Documentation d'Installation - TOKANA-ID

Ce guide vous permettra d'installer et de lancer le projet TOKANA-ID sur votre machine de présentation.

## Prérequis
- **Node.js** (v18+)
- **Python** (v3.10+)
- **MySQL Server**

## 1. Configuration de la Base de Données

1. Connectez-vous à MySQL :
   `mysql -u root -p`
2. Créez la base de données :
   `CREATE DATABASE vision2035;`
   `EXIT;`
3. Importez le schéma initial :
   `mysql -u root -p vision2035 < init_db.sql`

## 2. Backend (FastAPI)

1. Allez dans le répertoire backend :
   `cd backend`
2. Créez et activez un environnement virtuel :
   `python -m venv venv`
   `source venv/bin/activate` (ou `venv\Scripts\activate` sous Windows)
3. Installez les dépendances :
   `pip install fastapi uvicorn mysql-connector-python reportlab python-dotenv`
4. Lancez le serveur :
   `uvicorn app.main:app --reload`

## 3. Frontend (React + Vite)

1. Allez dans le répertoire frontend :
   `cd ../frontend`
2. Installez les dépendances :
   `npm install`
3. Lancez le serveur de développement :
   `npm run dev`

---
*Note : Assurez-vous que votre fichier `.env` dans la racine du backend contient `DB_PASSWORD=votre_mot_de_passe`.*
