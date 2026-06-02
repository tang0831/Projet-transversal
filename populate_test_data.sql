-- Nettoyage pour éviter les doublons (attention en production)
DELETE FROM forum_message;
DELETE FROM demande_acte;
DELETE FROM acte;
DELETE FROM Citoyen;
DELETE FROM utilisateur;

-- 1. Utilisateurs
INSERT INTO utilisateur (id_utilisateur, nom, mot_de_passe, role, id_localite) VALUES
(1, 'admin_tana', 'password123', 'ADMIN', 1667),
(2, 'agent_mahanoro', 'password123', 'AGENT', 1694),
(3, 'citoyen_test', 'password123', 'CITOYEN', 1667);

-- 2. Citoyens
INSERT INTO Citoyen (id_citoyen, nom, prenom, date_naissance, lieu_naissance, est_vivant, numero_cin, id_localite) VALUES
(1, 'RAKOTO', 'Jean', '1990-05-15', 'Antananarivo', 1, '101123456789', 1667),
(2, 'RASOA', 'Marie', '1985-08-20', 'Antananarivo', 1, '101987654321', 1667);

-- 3. Actes
INSERT INTO acte (id_acte, type_acte, date_acte, numero_registre, id_citoyen) VALUES
(1, 'NAISSANCE', '2026-01-15', 'REG-2026-001', 1),
(2, 'DECES', '2026-02-20', 'REG-2026-002', 2);

-- 4. Forum
INSERT INTO forum_message (id_utilisateur, contenu, date_envoi) VALUES
(3, 'Bonjour, je souhaite régulariser mon acte de naissance.', NOW());

INSERT INTO demande_acte (id_utilisateur, type_acte, statut, date_demande) VALUES
(3, 'MARIAGE', 'EN_ATTENTE', NOW());
