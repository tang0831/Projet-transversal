USE vision2035;

-- 1. Compléter les informations de Mialy (profession, domicile)
UPDATE citoyen 
SET profession = 'Étudiante', domicile = 'Lot IVG 20 Antsirabe' 
WHERE numero_cin = '777888';

-- 2. Créer l'acte de naissance pour Mialy
INSERT INTO acte (id_citoyen, type_acte, statut, details)
VALUES ((SELECT id FROM citoyen WHERE numero_cin = '777888'), 'NAISSANCE', 'OFFICIEL', 'Acte de naissance officiel');
