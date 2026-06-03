#!/bin/bash

# TOKANA ID Setup Script
echo "--- Starting TOKANA ID Environment Setup ---"

# 1. Frontend Setup
echo "[1/2] Setting up frontend..."
if [ -d "frontend" ]; then
    cd frontend
    npm install
    echo "Frontend dependencies installed."
    cd ..
else
    echo "Error: 'frontend' directory not found."
    exit 1
fi

# 2. Backend Instructions
echo "[2/2] Backend Setup Instructions"
echo "Please navigate to the 'backend' directory and follow the instructions in the README to set up the Python virtual environment and database."
echo "Ensure your database is running and configured correctly in your .env file."

echo "--- Setup Complete! ---"
