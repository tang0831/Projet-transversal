USE vision2035;

-- Ajouter de nouveaux citoyens
INSERT INTO citoyen (numero_cin, nom, prenom, date_naissance, lieu_naissance, sexe, profession, domicile, id_localite) VALUES
('999001', 'RAKOTO', 'Paul', '1990-05-15', 'Antananarivo', 'M', 'Ingénieur', 'Lot 1, Ivandry', 1),
('999002', 'RANDRIA', 'Léa', '1992-08-20', 'Antananarivo', 'F', 'Médecin', 'Lot 2, Analamahitsy', 1),
('999003', 'RAKOTO', 'Papa', '1965-01-01', 'Antananarivo', 'M', 'Retraité', 'Lot 1, Ivandry', 1),
('999004', 'RASOA', 'Maman', '1968-02-10', 'Antananarivo', 'F', 'Enseignante', 'Lot 1, Ivandry', 1);

-- Ajouter les comptes utilisateurs correspondants
INSERT INTO utilisateur (nom_utilisateur, mot_de_passe, role, id_localite, numero_cin) VALUES
('paul', 'password', 'CITOYEN', 1, '999001'),
('lea', 'password', 'CITOYEN', 1, '999002');

-- Créer des liens de parenté (Paul est l'enfant de Papa et Maman)
-- Note: On récupère les IDs via subqueries
INSERT INTO Lien_Parente (id_parent, id_enfant, type_lien)
SELECT p.id, e.id, 'PÈRE' FROM citoyen p, citoyen e WHERE p.numero_cin = '999003' AND e.numero_cin = '999001';

INSERT INTO Lien_Parente (id_parent, id_enfant, type_lien)
SELECT p.id, e.id, 'MÈRE' FROM citoyen p, citoyen e WHERE p.numero_cin = '999004' AND e.numero_cin = '999001';
