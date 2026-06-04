USE vision2035;

-- Ajouter un acte de naissance pour le citoyen 22222 (ID 18)
INSERT INTO acte (id_citoyen, type_acte, statut, details) 
VALUES (18, 'NAISSANCE', 'OFFICIEL', '{"lieu_naissance": "Antananarivo", "date_naissance": "1995-01-01"}');
