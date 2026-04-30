#!/usr/bin/env python3
import os
import sys
from datetime import datetime

# Import des modèles (Assure-toi que tes fichiers sont dans src/models/)
try:
    from backend.models.acte import Acte
    from backend.models.citoyen import Citoyen
    from backend.models.localite import Localite
    from backend.models.utilisateur import Utilisateur
except ImportError as e:
    print(f"❌ Erreur d'importation : {e}")
    sys.exit(1)


from backend.structures.boyer_moore import boyer_moore_search


# --- UTILITAIRES INTERFACE ---
def clean():
    os.system("clear")


def pause():
    input("\n[Appuyez sur Entrée pour continuer...]")


def header(t):
    print(f"\n{'═' * 50}\n {t.center(48)} \n{'═' * 50}")


def input_required(prompt):
    while True:
        value = input(prompt).strip()
        if value:
            return value
        print("⚠️ Ce champ est obligatoire. Veuillez saisir une valeur.")


# --- MODULE 1 : LOCALITÉS ---
def menu_localite():
    clean()
    header("GESTION DES LOCALITÉS (DISTRICTS/RÉGIONS)")
    print(
        "1. Ajouter une Localité\n2. Lister les Localités\n3. Modifier les Localites\n4. Supprimer les Localites\n0. Retour"
    )
    choix = input("\n> ")
    loc = Localite()
    if choix == "1":
        nom = input_required("Commune : ")
        dist = input_required("District : ")
        reg = input_required("Région : ")
        cp = input_required("Code Postal : ")
        loc.ajouter_localite(nom, dist, reg, cp)
        print("Localité enregistrée.")

    elif choix == "2":
        localites = loc.lister_tout()
        if localites:
            print(
                f"\n{'ID':<5} | {'Commune':<15} | {'District':<15} | {'Région':<15} | {'CP':<6}"
            )
            print("-" * 65)
            for l in localites:
                print(f"{l[0]:<5} | {l[1]:<15} | {l[2]:<15} | {l[3]:<15} | {l[4]:<6}")
        else:
            print("Aucun localité enregistrée.")

    elif choix == "3":
        id_localite = input_required("ID Localité : ")
        nom = input_required("Commune : ")
        dist = input_required("District : ")
        reg = input_required("Région : ")
        cp = input_required("Code Postal : ")
        loc.modifier_localite(id_localite, nom, dist, reg, cp)

    elif choix == "4":
        id_localite = input_required("ID Localité : ")
        loc.supprimer_localite(id_localite)

    pause()


# --- MODULE 2 : CITOYENS & RECHERCHE ---
def menu_citoyen():
    clean()
    header("GESTION DES CITOYENS")
    print(
        "1. Nouveau Citoyen\n2. Lister tous les Citoyens\n3. Recherche Citoyen (Boyer-Moore)\n4. Modifier Citoyen\n5. Supprimer Citoyen\n0. Retour"
    )
    choix = input("\n> ")
    cit_model = Citoyen()

    if choix == "1":
        nom = input_required("NOM : ").upper()
        prenom = input_required("Prénom : ")
        date_n = input_required("Date Naissance (AAAA-MM-JJ) : ")
        lieu = input_required("Lieu de naissance : ")
        cin = input_required("Numéro CIN : ")
        sexe = input_required("Sexe (M/F) : ").upper()
        # On suppose que l'ID localité 1 existe par défaut
        cit_model.ajouter_citoyen(nom, prenom, date_n, lieu, True, sexe, cin)
        print(f" Citoyen {nom} ajouté.")

    elif choix == "2":
        citoyens = cit_model.lister_tout()
        if citoyens:
            print(
                f"\n{'ID':<5} | {'NOM':<15} | {'Prénom':<15} | {'CIN':<12} | {'Sexe':<5}"
            )
            print("-" * 60)
            for c in citoyens:
                print(f"{c[0]:<5} | {c[1]:<15} | {c[2]:<15} | {c[7]:<12} | {c[6]:<5}")
        else:
            print("Aucun citoyen enregistré.")

    elif choix == "3":
        pattern = input_required("Entrez le NOM à rechercher : ").upper()
        # Récupération de tous les noms pour le moteur BM
        query = "SELECT nom, prenom, numero_cin FROM Citoyen"
        res = cit_model.conn.execute_query(query)
        found = [r for r in res if boyer_moore_search(r[0], pattern) != -1]

        if found:
            for f in found:
                print(f"🔹 [{f[2]}] {f[0]} {f[1]}")
        else:
            print("❌ Aucun résultat.")

    elif choix == "4":
        id_c = input_required("ID Citoyen à modifier : ")
        nom = input_required("Nouveau NOM : ").upper()
        prenom = input_required("Nouveau Prénom : ")
        date_n = input_required("Nouvelle Date Naissance (AAAA-MM-JJ) : ")
        lieu = input_required("Nouveau Lieu de naissance : ")
        cin = input_required("Nouveau Numéro CIN : ")
        sexe = input_required("Nouveau Sexe (M/F) : ").upper()
        vivant = input_required("Est-il vivant ? (O/N) : ").upper() == "O"
        cit_model.modifier_citoyen(id_c, nom, prenom, date_n, lieu, vivant, sexe, cin)

    elif choix == "5":
        id_c = input_required("ID Citoyen à supprimer : ")
        cit_model.supprimer_citoyen(id_c)

    pause()


# --- MODULE 3 : ACTES (NAISSANCE/DECES) ---
def menu_acte():
    clean()
    header("REGISTRE DES ACTES")
    acte_model = Acte()
    print(
        "1. Créer un Acte\n2. Historique des Actes\n3. Modifier un Acte\n4. Supprimer un Acte\n0. Retour"
    )
    choix = input("\n> ")
    if choix == "1":
        t = input_required("Type (NAISSANCE/DECES/MARIAGE) : ").upper()
        date_a = input_required("Date de l'acte (AAAA-MM-JJ) : ")
        num_r = input_required("N° Registre : ")
        acte_model.ajouter_acte(t, date_a, num_r, datetime.now().strftime("%Y-%m-%d"))
        print("✅ Acte indexé.")
    elif choix == "2":
        actes = acte_model.lister_tout()
        if actes:
            print(
                f"\n{'ID':<5} | {'Type':<12} | {'Date Acte':<12} | {'N° Registre':<15}"
            )
            print("-" * 50)
            for a in actes:
                print(f"{a[0]:<5} | {a[1]:<12} | {str(a[2]):<12} | {a[3]:<15}")
        else:
            print("Aucun acte enregistré.")
    elif choix == "3":
        id_a = input_required("ID Acte à modifier : ")
        t = input_required("Nouveau Type : ").upper()
        date_a = input_required("Nouvelle Date (AAAA-MM-JJ) : ")
        num_r = input_required("Nouveau N° Registre : ")
        acte_model.modifier_acte(
            id_a, t, date_a, num_r, datetime.now().strftime("%Y-%m-%d")
        )
    elif choix == "4":
        id_a = input_required("ID Acte à supprimer : ")
        acte_model.supprimer_acte(id_a)
    pause()


# --- MODULE 4 : UTILISATEURS (ADMINISTRATION) ---
def menu_admin():
    clean()
    header("ADMINISTRATION SYSTÈME")
    user_model = Utilisateur()
    print(
        "1. Créer un Utilisateur\n2. Lister les Utilisateurs\n3. Modifier un Utilisateur\n4. Supprimer un Utilisateur\n0. Retour"
    )
    choix = input("\n> ")

    if choix == "1":
        user = input_required("Identifiant : ")
        pwd = input_required("Mot de passe : ")
        role = input_required("Rôle (ADMIN/AGENT) : ")
        user_model.ajouter_utilisateur(user, pwd, role)
    elif choix == "2":
        users = user_model.lister_tout()
        if users:
            print(f"\n{'ID':<5} | {'Identifiant':<20} | {'Rôle':<10}")
            print("-" * 40)
            for u in users:
                print(f"{u[0]:<5} | {u[1]:<20} | {u[3]:<10}")
        else:
            print("Aucun utilisateur enregistré.")
    elif choix == "3":
        id_u = input_required("ID Utilisateur à modifier : ")
        user = input_required("Nouvel Identifiant : ")
        pwd = input_required("Nouveau Mot de passe : ")
        role = input_required("Nouveau Rôle (ADMIN/AGENT) : ")
        user_model.modifier_utilisateur(id_u, user, pwd, role)
    elif choix == "4":
        id_u = input_required("ID Utilisateur à supprimer : ")
        user_model.supprimer_utilisateur(id_u)

    pause()


# --- MAIN LOOP ---
def main():
    while True:
        clean()
        print("\033[1;36m" + "╔══════════════════════════════════════════════════╗")
        print("║          🏛️  VISION 2035 : ÉTAT CIVIL            ║")
        print("╚══════════════════════════════════════════════════╝" + "\033[0m")
        print(" [1] 📍 Gestion des Localités")
        print(" [2] 👤 Gestion des Citoyens")
        print(" [3] 📄 Registre des Actes")
        print(" [4] 🔑 Administration Utilisateurs")
        print(" [0] 🚪 Quitter")

        c = input("\nSelectionnez une option : ")
        if c == "1":
            menu_localite()
        elif c == "2":
            menu_citoyen()
        elif c == "3":
            menu_acte()
        elif c == "4":
            menu_admin()
        elif c == "0":
            print("\n👋 Déconnexion de willia@wiwi...")
            break
        else:
            print("⚠️ Choix invalide.")
            pause()


if __name__ == "__main__":
    main()
