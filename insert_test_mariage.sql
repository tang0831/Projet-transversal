USE vision2035;

-- 1. Créer l'acte de type MARIAGE pour Jean (Époux)
INSERT INTO acte (id_citoyen, type_acte, details) 
SELECT id, 'MARIAGE', 'Acte de mariage officiel' FROM citoyen WHERE numero_cin = '000001';
SET @acte_id = LAST_INSERT_ID();

-- 2. Insérer les détails du mariage entre Jean (000001) et Marie (000002)
INSERT INTO mariage (id_acte, id_epoux, id_epouse, date_mariage, lieu_mariage, regime_matrimonial)
SELECT 
    @acte_id,
    (SELECT id FROM citoyen WHERE numero_cin = '000001'),
    (SELECT id FROM citoyen WHERE numero_cin = '000002'),
    '2005-06-12',
    'Mairie d''Antananarivo I',
    'Communauté de biens réduite aux acquêts'
;
