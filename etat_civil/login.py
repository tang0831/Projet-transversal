from backend.models.utilisateur import Utilisateur


def login_user(username, password):
    user_model = Utilisateur()
    user = user_model.verifier_identifiants(username, password)
    if user:
        print(f"Bienvenue, {user[1]} ! (Rôle: {user[3]})")
        return user
    else:
        print(" Identifiants invalides.")
        return None


if __name__ == "__main__":
    import getpass

    print("--- CONNEXION VISION 2035 ---")
    u = input("Utilisateur : ")
    p = getpass.getpass("Mot de passe : ")
    login_user(u, p)
