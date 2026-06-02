-- Création de la base de données
CREATE DATABASE IF NOT EXISTS Etat_civil;
USE Etat_civil;

-- Table des localités
CREATE TABLE IF NOT EXISTS localite (
    id_localite INT AUTO_INCREMENT PRIMARY KEY,
    nom_commune VARCHAR(255),
    district VARCHAR(255),
    region VARCHAR(255),
    code_postal VARCHAR(20)
);

-- Table des citoyens
CREATE TABLE IF NOT EXISTS Citoyen (
    id_citoyen INT AUTO_INCREMENT PRIMARY KEY,
    numero_cin VARCHAR(50) UNIQUE,
    nom VARCHAR(255),
    prenom VARCHAR(255),
    date_naissance DATE,
    lieu_naissance VARCHAR(255),
    est_vivant BOOLEAN DEFAULT 1,
    sexe VARCHAR(10),
    id_localite INT,
    FOREIGN KEY (id_localite) REFERENCES localite(id_localite)
);

-- Table des actes
CREATE TABLE IF NOT EXISTS acte (
    id_acte INT AUTO_INCREMENT PRIMARY KEY,
    type_acte VARCHAR(100),
    date_acte DATE,
    numero_registre VARCHAR(100),
    date_registrement DATE,
    id_citoyen INT,
    FOREIGN KEY (id_citoyen) REFERENCES Citoyen(id_citoyen)
);

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS utilisateur (
    id_utilisateur INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) UNIQUE,
    mot_de_passe VARCHAR(255),
    role VARCHAR(50), -- ADMIN, AGENT
    id_localite INT,
    photo VARCHAR(255),
    FOREIGN KEY (id_localite) REFERENCES localite(id_localite)
);

-- Table des logs système
CREATE TABLE IF NOT EXISTS systeme_log (
    id_log INT AUTO_INCREMENT PRIMARY KEY,
    action VARCHAR(255),
    details TEXT,
    date_log DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table des messages privés
CREATE TABLE IF NOT EXISTS private_message (
    id_p_message INT AUTO_INCREMENT PRIMARY KEY,
    id_expediteur INT,
    id_destinataire INT,
    contenu TEXT,
    fichier_url VARCHAR(255),
    date_envoi DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_expediteur) REFERENCES utilisateur(id_utilisateur),
    FOREIGN KEY (id_destinataire) REFERENCES utilisateur(id_utilisateur)
);

-- Table des demandes d'actes
CREATE TABLE IF NOT EXISTS demande_acte (
    id_demande INT AUTO_INCREMENT PRIMARY KEY,
    id_utilisateur INT,
    type_acte VARCHAR(100),
    statut VARCHAR(50) DEFAULT 'EN_ATTENTE',
    date_demande DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_utilisateur) REFERENCES utilisateur(id_utilisateur)
);

-- Table de synchronisation des fichiers
CREATE TABLE IF NOT EXISTS files_synchro (
    id INT AUTO_INCREMENT PRIMARY KEY,
    donnees_synchro TEXT,
    statut VARCHAR(50),
    priorite INT,
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insertion d'un administrateur par défaut
INSERT INTO utilisateur (nom, mot_de_passe, role) VALUES ('admin', 'admin123', 'ADMIN');
