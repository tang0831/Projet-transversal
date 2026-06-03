-- Base de données : Vision 2035
CREATE DATABASE IF NOT EXISTS vision2035;
USE vision2035;

-- Table des localités
CREATE TABLE IF NOT EXISTS localite (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    code_postal VARCHAR(10)
) ENGINE=InnoDB;

-- Insertion de la localité par défaut
INSERT INTO localite (nom, code_postal) VALUES ('Antananarivo', '101');

-- Table des citoyens
CREATE TABLE IF NOT EXISTS citoyen (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_cin VARCHAR(20) UNIQUE NOT NULL,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100),
    date_naissance DATE,
    lieu_naissance VARCHAR(100),
    sexe CHAR(1),
    est_vivant BOOLEAN DEFAULT TRUE,
    profession VARCHAR(100),
    domicile VARCHAR(255),
    id_localite INT,
    CONSTRAINT fk_cit_loc FOREIGN KEY (id_localite) REFERENCES localite(id)
) ENGINE=InnoDB;

-- Table des actes
CREATE TABLE IF NOT EXISTS acte (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_citoyen INT NOT NULL,
    type_acte ENUM('NAISSANCE', 'MARIAGE', 'DECES') NOT NULL,
    date_enregistrement DATETIME DEFAULT CURRENT_TIMESTAMP,
    details TEXT,
    CONSTRAINT fk_acte_cit FOREIGN KEY (id_citoyen) REFERENCES citoyen(id)
) ENGINE=InnoDB;

-- Table des mentions marginales
CREATE TABLE IF NOT EXISTS mention_marginale (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_acte INT NOT NULL,
    type_mention ENUM('MARIAGE', 'DIVORCE', 'CHANGEMENT_NOM', 'DECES', 'NATIONALITE') NOT NULL,
    details TEXT,
    date_enregistrement DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_mention_acte FOREIGN KEY (id_acte) REFERENCES acte(id)
) ENGINE=InnoDB;

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS utilisateur (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom_utilisateur VARCHAR(50) UNIQUE NOT NULL,
    mot_de_passe VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'OFFICIER', 'AGENT', 'CITOYEN') NOT NULL,
    id_localite INT,
    numero_cin VARCHAR(20),
    CONSTRAINT fk_user_loc FOREIGN KEY (id_localite) REFERENCES localite(id)
) ENGINE=InnoDB;

-- Table de parenté (Union-Find)
CREATE TABLE IF NOT EXISTS Lien_Parente (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_parent INT NOT NULL,
    id_enfant INT NOT NULL,
    type_lien ENUM('PÈRE', 'MÈRE') NOT NULL,
    CONSTRAINT fk_parent FOREIGN KEY (id_parent) REFERENCES citoyen(id),
    CONSTRAINT fk_enfant FOREIGN KEY (id_enfant) REFERENCES citoyen(id)
) ENGINE=InnoDB;

-- Table de synchronisation (Mode hors-ligne)
CREATE TABLE IF NOT EXISTS Synchro_File (
    id INT AUTO_INCREMENT PRIMARY KEY,
    donnees_json TEXT NOT NULL,
    statut ENUM('EN_ATTENTE', 'SYNCHRONISE', 'ERREUR') DEFAULT 'EN_ATTENTE',
    priorite INT DEFAULT 1,
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Table de logs système
CREATE TABLE IF NOT EXISTS systeme_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_utilisateur INT,
    action VARCHAR(255) NOT NULL,
    details TEXT,
    date_log DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_log_user FOREIGN KEY (id_utilisateur) REFERENCES utilisateur(id)
) ENGINE=InnoDB;

-- Table pour le Forum de coordination
CREATE TABLE IF NOT EXISTS forum_message (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_utilisateur INT NOT NULL,
    message TEXT NOT NULL,
    date_envoi DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_forum_user FOREIGN KEY (id_utilisateur) REFERENCES utilisateur(id)
) ENGINE=InnoDB;
