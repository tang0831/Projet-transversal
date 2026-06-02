from backend.models.utilisateur import Utilisateur

u = Utilisateur()
# Test manuel de la fonction verifier_identifiants utilisée par le contrôleur
# Utilisation de 'fanamby' et '12345' trouvés en base
nom = "fanamby"
pwd = "12345"
resultat = u.verifier_identifiants(nom, pwd)

print(f"Test pour '{nom}' avec '{pwd}': {resultat}")

# Liste pour déboguer si le nom contient des espaces cachés
utilisateurs = u.lister_tout()
for ut in utilisateurs:
    print(f"User: '{ut[1]}'|'{ut[2]}'")
