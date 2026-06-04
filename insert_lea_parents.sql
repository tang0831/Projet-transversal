USE vision2035;

-- Ajouter les parents de Léa
INSERT INTO citoyen (numero_cin, nom, prenom, date_naissance, lieu_naissance, sexe, profession, domicile, id_localite) VALUES
('999005', 'RANDRIA', 'PapaLéa', '1960-01-01', 'Antananarivo', 'M', 'Artisan', 'Lot 2, Analamahitsy', 1),
('999006', 'RAKOTO', 'MamanLéa', '1963-02-10', 'Antananarivo', 'F', 'Couturière', 'Lot 2, Analamahitsy', 1);

-- Créer les liens de parenté pour Léa
INSERT INTO Lien_Parente (id_parent, id_enfant, type_lien)
SELECT p.id, e.id, 'PÈRE' FROM citoyen p, citoyen e WHERE p.numero_cin = '999005' AND e.numero_cin = '999002';

INSERT INTO Lien_Parente (id_parent, id_enfant, type_lien)
SELECT p.id, e.id, 'MÈRE' FROM citoyen p, citoyen e WHERE p.numero_cin = '999006' AND e.numero_cin = '999002';
