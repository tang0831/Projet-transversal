USE vision2035;

-- Nettoyage
DELETE FROM mariage;
DELETE FROM acte WHERE type_acte = 'MARIAGE';
DELETE FROM utilisateur WHERE nom_utilisateur IN ('userA', 'userB');
DELETE FROM citoyen WHERE numero_cin IN ('111111', '222222');

-- Création des citoyens
INSERT INTO citoyen (numero_cin, nom, prenom, sexe) VALUES ('111111', 'UserA', 'Test', 'M');
INSERT INTO citoyen (numero_cin, nom, prenom, sexe) VALUES ('222222', 'UserB', 'Test', 'F');

-- Création des utilisateurs
INSERT INTO utilisateur (nom_utilisateur, mot_de_passe, role, numero_cin) VALUES ('userA', 'pwd', 'CITOYEN', '111111');
INSERT INTO utilisateur (nom_utilisateur, mot_de_passe, role, numero_cin) VALUES ('userB', 'pwd', 'CITOYEN', '222222');
