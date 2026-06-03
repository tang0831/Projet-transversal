USE vision2035;

-- 1. Création de Mialy (la future épouse d'Andry)
INSERT INTO citoyen (numero_cin, nom, prenom, date_naissance, lieu_naissance, sexe, profession, domicile, id_localite)
VALUES ('777888', 'RAZAFY', 'Mialy', '2012-03-10', 'Antsirabe', 'F', 'Étudiante', 'Lot IVG 20', 1);

-- Compte utilisateur pour Mialy
INSERT INTO utilisateur (nom_utilisateur, mot_de_passe, role, id_localite, numero_cin)
VALUES ('mialy', 'mialy123', 'CITOYEN', 1, '777888');

-- 2. Création d'un compte AGENT pour la mairie
INSERT INTO utilisateur (nom_utilisateur, mot_de_passe, role, id_localite)
VALUES ('agent_mairie', 'agent123', 'AGENT', 1);

-- 3. Création d'un compte ADMIN
INSERT INTO utilisateur (nom_utilisateur, mot_de_passe, role, id_localite)
VALUES ('admin_vision', 'admin123', 'ADMIN', 1);
