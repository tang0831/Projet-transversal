from datetime import datetime
from backend.models.acte import Acte
from backend.models.citoyen import Citoyen
from backend.models.localite import Localite
from backend.models.systeme_log import SystemeLog
from backend.models.utilisateur import Utilisateur

def tester_systeme():
    print("🚀 === DÉBUT DES TESTS DU SYSTÈME (VISION 2035) ===\n")

    try:
        # 1. Test LOCALITE
        print("--- Test Localite ---")
        loc = Localite() # Marche maintenant car on a mis =None dans __init__
        loc.ajouter_localite("Antananarivo", "Tana Ville", "Analamanga", 101)
        # On essaie de récupérer la localité avec l'ID 1
        loc.obtenir_localite(1)
        if hasattr(loc, 'nom_commune') and loc.nom_commune:
            print(f"✅ Localité récupérée : {loc.nom_commune} ({loc.region})")
        else:
            print("⚠️ Note: Localité ID 1 non trouvée (Base peut-être vide)")

        # 2. Test CITOYEN
        print("\n👤 --- Test Citoyen ---")
        cit = Citoyen()
        cit.ajouter_citoyen("RAKOTO", "Jean", "1990-05-15", "Antananarivo", 1, "M", "101202303404")
        cit.obtenir_citoyen(1)
        if hasattr(cit, 'nom') and cit.nom:
            print(f"✅ Citoyen récupéré : {cit.nom} {cit.prenom}")

        # 3. Test ACTE
        print("\n📄 --- Test Acte ---")
        acte = Acte()
        acte.ajouter_acte("Naissance", "2024-01-10", "REG-2024-001", "2024-01-12")
        acte.obtenir_acte(1)
        if hasattr(acte, 'type_acte') and acte.type_acte:
            print(f"✅ Acte récupéré : Type {acte.type_acte}, Numéro {acte.numero_registre}")

        # 4. Test UTILISATEUR
        print("\n🔑 --- Test Utilisateur ---")
        user = Utilisateur()
        user.ajouter_utilisateur("admin_test", "password123", "administrateur")
        # On passe l'ID directement à obtenir_utilisateur
        user.obtenir_utilisateur(1)
        if hasattr(user, 'nom') and user.nom:
            print(f"✅ Utilisateur récupéré : {user.nom} (Rôle: {user.role})")

        # 5. Test LOGS
        print("\n📝 --- Test Système Log ---")
        log = SystemeLog()
        maintenant = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        log.ajouter_log("INSERT", "Test global du système", maintenant)
        log.obtenir_log(1)
        if hasattr(log, 'action') and log.action:
            print(f"✅ Log récupéré : Action {log.action} - {log.details}")

    except Exception as e:
        print(f"\n❌ ERREUR DURANT LE TEST : {e}")
    
    finally:
        print("\n=== FIN DES TESTS ===")

if __name__ == "__main__":
    tester_systeme()