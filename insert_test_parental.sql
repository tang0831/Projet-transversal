USE vision2035;

-- Insertion du Père
INSERT INTO citoyen (numero_cin, nom, prenom, date_naissance, lieu_naissance, sexe, profession, domicile, id_localite)
VALUES ('000001', 'RAKOTO', 'Jean', '1980-05-15', 'Antananarivo', 'M', 'Chauffeur', 'Lot IVG 10', 1);
SET @papa_id = LAST_INSERT_ID();

-- Insertion de la Mère
INSERT INTO citoyen (numero_cin, nom, prenom, date_naissance, lieu_naissance, sexe, profession, domicile, id_localite)
VALUES ('000002', 'RASOA', 'Marie', '1982-10-20', 'Antsirabe', 'F', 'Couturière', 'Lot IVG 10', 1);
SET @maman_id = LAST_INSERT_ID();

-- Insertion de l'Enfant (Andry)
INSERT INTO citoyen (numero_cin, nom, prenom, date_naissance, lieu_naissance, sexe, profession, domicile, id_localite)
VALUES ('123456', 'RAKOTO', 'Andry', '2010-01-01', 'Antananarivo', 'M', 'Étudiant', 'Lot IVG 10', 1);
SET @enfant_id = LAST_INSERT_ID();

-- Insertion de l'Acte de Naissance pour l'enfant
INSERT INTO acte (id_citoyen, type_acte, details)
VALUES (@enfant_id, 'NAISSANCE', 'Acte de naissance officiel de test');

-- Insertion des Liens de Parenté
INSERT INTO Lien_Parente (id_parent, id_enfant, type_lien) VALUES (@papa_id, @enfant_id, 'PÈRE');
INSERT INTO Lien_Parente (id_parent, id_enfant, type_lien) VALUES (@maman_id, @enfant_id, 'MÈRE');
