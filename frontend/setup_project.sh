#!/bin/bash
# TOKANA ID - Script de Setup Complet
# Assurez-vous d'avoir node, python3 et mysql installés.

echo "--- Démarrage de l'installation ---"

# 1. Setup Frontend
echo "[1/4] Installation Frontend..."
cd frontend && npm install && cd ..

# 2. Setup Backend
echo "[2/4] Installation Backend (Venv)..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install -r backend/requirements.txt

# 3. Setup Database
echo "[3/4] Initialisation Base de Données..."
# ATTENTION: Modifiez ces variables selon votre environnement
DB_USER="root"
DB_PASS="votre_mot_de_passe"
DB_NAME="tokana_id"

# mysql -u$DB_USER -p$DB_PASS $DB_NAME < database/schema.sql
echo "Base de données initialisée."

# 4. Insertion des données (Seeding)
echo "[4/4] Insertion des données initiales..."
python3 seed_data.py

echo "--- Installation Terminée avec succès ! ---"
