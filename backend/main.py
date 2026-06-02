import os
import sys

# Ajout du répertoire courant au path pour s'assurer que les imports fonctionnent
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import app
from views.console_view import main

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n Sortie du programme.")
        sys.exit(0)
