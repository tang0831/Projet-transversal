#!/bin/bash

# Script de démarrage pour TOKANA-ID
# Utilisation : ./setup_and_run.sh <DB_PASSWORD>

DB_PASSWORD=$1

if [ -z "$DB_PASSWORD" ]; then
    echo "Usage: ./setup_and_run.sh <DB_PASSWORD>"
    exit 1
fi

echo "--- Initialisation de la BDD ---"
mysql -u root -p"$DB_PASSWORD" -e "CREATE DATABASE IF NOT EXISTS vision2035;"
mysql -u root -p"$DB_PASSWORD" vision2035 < init_db.sql

echo "--- Démarrage Backend ---"
cd backend
python3 -m venv venv
source venv/bin/activate
pip install fastapi uvicorn mysql-connector-python reportlab python-dotenv
echo "DB_PASSWORD=$DB_PASSWORD" > .env
uvicorn app.main:app --reload &
BACKEND_PID=$!

echo "--- Démarrage Frontend ---"
cd ../frontend
npm install
npm run dev &
FRONTEND_PID=$!

echo "TOKANA-ID lancé !"
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo "Appuyez sur Ctrl+C pour arrêter le tout."

trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait
