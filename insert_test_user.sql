-- Insertion d'un utilisateur de test (admin)
-- Note : Dans un environnement réel, le mot de passe doit être haché.
INSERT INTO utilisateur (nom_utilisateur, mot_de_passe, role, id_localite) 
VALUES ('admin', 'password', 'ADMIN', 1);
