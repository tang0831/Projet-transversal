USE vision2035;

-- 1. Insertion du Père de Mialy
INSERT INTO citoyen (numero_cin, nom, prenom, date_naissance, lieu_naissance, sexe, profession, domicile, id_localite)
VALUES ('000003', 'RAZAFY', 'Pierre', '1975-02-10', 'Antsirabe', 'M', 'Agriculteur', 'Lot IVG 20', 1);
SET @papa_mialy = LAST_INSERT_ID();

-- 2. Insertion de la Mère de Mialy
INSERT INTO citoyen (numero_cin, nom, prenom, date_naissance, lieu_naissance, sexe, profession, domicile, id_localite)
VALUES ('000004', 'RAZAFY', 'Clara', '1978-11-05', 'Antsirabe', 'F', 'Commerçante', 'Lot IVG 20', 1);
SET @maman_mialy = LAST_INSERT_ID();

-- 3. Récupérer l'ID de Mialy
SET @id_mialy = (SELECT id FROM citoyen WHERE numero_cin = '777888');

-- 4. Insertion des Liens de Parenté
INSERT INTO Lien_Parente (id_parent, id_enfant, type_lien) VALUES (@papa_mialy, @id_mialy, 'PÈRE');
INSERT INTO Lien_Parente (id_parent, id_enfant, type_lien) VALUES (@maman_mialy, @id_mialy, 'MÈRE');
