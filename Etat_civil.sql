-- phpMyAdmin SQL Dump
-- version 5.2.1deb3
-- https://www.phpmyadmin.net/
--
-- Hôte : localhost:3306
-- Généré le : sam. 21 mars 2026 à 18:44
-- Version du serveur : 8.0.42-0ubuntu0.24.10.1
-- Version de PHP : 8.3.11

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";SET FOREIGN_KEY_CHECKS = 0;

-- On supprime tout pour repartir sur des noms propres
DROP TABLE IF EXISTS Synchro_File, systeme_log, Lien_Parente, Acte, acte, Citoyen, citoyen, Utilisateur, utilisateur, Localite, localite;

-- 1. Table localite (en minuscules pour correspondre à ton erreur)
CREATE TABLE localite (
    id_localite INT AUTO_INCREMENT PRIMARY KEY,
    nom_commune VARCHAR(100),
    district VARCHAR(100),
    region VARCHAR(100),
    code_postal VARCHAR(10)
) ENGINE=InnoDB;

-- 2. Table Citoyen (avec Majuscule car ton code fait 'INSERT INTO Citoyen')
CREATE TABLE Citoyen (
    id_citoyen INT AUTO_INCREMENT PRIMARY KEY,
    numero_cin VARCHAR(20) UNIQUE,
    nom VARCHAR(100),
    prenom VARCHAR(100), -- Vérifie bien : prenom SANS 'S'
    date_naissance DATE,
    lieu_naissance VARCHAR(100),
    est_vivant BOOLEAN DEFAULT TRUE,
    sexe CHAR(1),
    id_localite INT,
    CONSTRAINT fk_cit_loc FOREIGN KEY (id_localite) REFERENCES localite(id_localite)
) ENGINE=InnoDB;

-- 3. Table acte (minuscule)
CREATE TABLE acte (
    id_acte INT AUTO_INCREMENT PRIMARY KEY,
    type_acte VARCHAR(50),
    date_acte DATE,
    numero_registre VARCHAR(50),
    date_registrement DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 4. Table utilisateur (minuscule)
CREATE TABLE utilisateur (
    id_utilisateur INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100),
    mot_de_passe VARCHAR(255),
    role VARCHAR(50)
) ENGINE=InnoDB;

-- 5. Table systeme_log (minuscule)
CREATE TABLE systeme_log (
    id_log INT AUTO_INCREMENT PRIMARY KEY,
    action VARCHAR(50),
    details TEXT,
    date_log DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `Etat_civil`
--

-- --------------------------------------------------------

--
-- Structure de la table `Acte`
--

CREATE TABLE `Acte` (
  `id_acte` int NOT NULL,
  `numero_registre` varchar(50) NOT NULL,
  `type_acte` varchar(20) DEFAULT NULL,
  `date_acte` date NOT NULL,
  `date_registrement` datetime DEFAULT CURRENT_TIMESTAMP,
  `id_citoyen` int DEFAULT NULL,
  `id_utilisateur` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `Citoyen`
--

CREATE TABLE `Citoyen` (
  `id_citoyen` int NOT NULL,
  `numero_cin` varchar(20) NOT NULL,
  `nom` varchar(150) NOT NULL,
  `prenom` varchar(200) DEFAULT NULL,
  `date_naissance` date NOT NULL,
  `lieu_naissance` varchar(150) DEFAULT NULL,
  `sexe` char(1) DEFAULT NULL,
  `est_vivant` tinyint(1) DEFAULT '1',
  `id_localite` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `Lien_Parente`
--

CREATE TABLE `Lien_Parente` (
  `id_parent` int NOT NULL,
  `id_enfant` int NOT NULL,
  `type_parent` varchar(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `Localite`
--

CREATE TABLE `Localite` (
  `id_localite` int NOT NULL,
  `nom_commune` varchar(100) NOT NULL,
  `district` varchar(100) NOT NULL,
  `region` varchar(100) NOT NULL,
  `code_postal` varchar(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `Synchro_File`
--

CREATE TABLE `Synchro_File` (
  `id_synchro` int NOT NULL,
  `donnees_json` text NOT NULL,
  `statut` varchar(20) DEFAULT 'EN_ATTENTE',
  `priorite` int DEFAULT '1',
  `date_creation` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `systeme_log`
--

CREATE TABLE `systeme_log` (
  `id_log` int NOT NULL,
  `action` varchar(255) NOT NULL,
  `details` text,
  `date_log` datetime DEFAULT CURRENT_TIMESTAMP,
  `id_utilisateur` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `Utilisateur`
--

CREATE TABLE `Utilisateur` (
  `id_utilisateur` int NOT NULL,
  `nom` varchar(50) NOT NULL,
  `mot_de_passe` text NOT NULL,
  `role` varchar(20) DEFAULT NULL,
  `id_localite` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `Acte`
--
ALTER TABLE `Acte`
  ADD PRIMARY KEY (`id_acte`),
  ADD UNIQUE KEY `numero_registre` (`numero_registre`),
  ADD KEY `fk_acte_citoyen` (`id_citoyen`),
  ADD KEY `fk_acte_user` (`id_utilisateur`);

--
-- Index pour la table `Citoyen`
--
ALTER TABLE `Citoyen`
  ADD PRIMARY KEY (`id_citoyen`),
  ADD UNIQUE KEY `numero_cin` (`numero_cin`),
  ADD KEY `fk_citoyen_lieu` (`id_localite`);

--
-- Index pour la table `Lien_Parente`
--
ALTER TABLE `Lien_Parente`
  ADD PRIMARY KEY (`id_parent`,`id_enfant`),
  ADD KEY `fk_enfant` (`id_enfant`);

--
-- Index pour la table `Localite`
--
ALTER TABLE `Localite`
  ADD PRIMARY KEY (`id_localite`);

--
-- Index pour la table `Synchro_File`
--
ALTER TABLE `Synchro_File`
  ADD PRIMARY KEY (`id_synchro`);

--
-- Index pour la table `systeme_log`
--
ALTER TABLE `systeme_log`
  ADD PRIMARY KEY (`id_log`),
  ADD KEY `fk_log_user` (`id_utilisateur`);

--
-- Index pour la table `Utilisateur`
--
ALTER TABLE `Utilisateur`
  ADD PRIMARY KEY (`id_utilisateur`),
  ADD UNIQUE KEY `nom` (`nom`),
  ADD KEY `fk_user_lieu` (`id_localite`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `Acte`
--
ALTER TABLE `Acte`
  MODIFY `id_acte` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `Citoyen`
--
ALTER TABLE `Citoyen`
  MODIFY `id_citoyen` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `Localite`
--
ALTER TABLE `Localite`
  MODIFY `id_localite` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `Synchro_File`
--
ALTER TABLE `Synchro_File`
  MODIFY `id_synchro` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `systeme_log`
--
ALTER TABLE `systeme_log`
  MODIFY `id_log` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `Utilisateur`
--
ALTER TABLE `Utilisateur`
  MODIFY `id_utilisateur` int NOT NULL AUTO_INCREMENT;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `Acte`
--
ALTER TABLE `Acte`
  ADD CONSTRAINT `fk_acte_citoyen` FOREIGN KEY (`id_citoyen`) REFERENCES `Citoyen` (`id_citoyen`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_acte_user` FOREIGN KEY (`id_utilisateur`) REFERENCES `Utilisateur` (`id_utilisateur`);

--
-- Contraintes pour la table `Citoyen`
--
ALTER TABLE `Citoyen`
  ADD CONSTRAINT `fk_citoyen_lieu` FOREIGN KEY (`id_localite`) REFERENCES `Localite` (`id_localite`) ON DELETE SET NULL;

--
-- Contraintes pour la table `Lien_Parente`
--
ALTER TABLE `Lien_Parente`
  ADD CONSTRAINT `fk_enfant` FOREIGN KEY (`id_enfant`) REFERENCES `Citoyen` (`id_citoyen`),
  ADD CONSTRAINT `fk_parent` FOREIGN KEY (`id_parent`) REFERENCES `Citoyen` (`id_citoyen`);

--
-- Contraintes pour la table `systeme_log`
--
ALTER TABLE `systeme_log`
  ADD CONSTRAINT `fk_log_user` FOREIGN KEY (`id_utilisateur`) REFERENCES `Utilisateur` (`id_utilisateur`);

--
-- Contraintes pour la table `Utilisateur`
--
ALTER TABLE `Utilisateur`
  ADD CONSTRAINT `fk_user_lieu` FOREIGN KEY (`id_localite`) REFERENCES `Localite` (`id_localite`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
