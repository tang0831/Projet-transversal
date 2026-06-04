USE vision2035;

-- Ajouter un acte de naissance pour Paul (ID 12) directement dans la table acte
-- Le type 'NAISSANCE' est dans l'enum
INSERT INTO acte (id_citoyen, type_acte, statut, details) VALUES (12, 'NAISSANCE', 'OFFICIEL', '{"lieu_naissance": "Antananarivo", "date_naissance": "1990-05-15"}');
