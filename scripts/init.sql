-- =============================================================
-- Script d'initialisation de la base de données SYM_AD
-- Ce script crée les tables et insère des données fictives
-- pour permettre le fonctionnement de l'application
-- =============================================================

-- Création de la base de données (si pas déjà créée par docker)
CREATE DATABASE IF NOT EXISTS sym_ad;
USE sym_ad;

-- =============================================================
-- TABLE: utilisateurs
-- =============================================================
DROP TABLE IF EXISTS telephones;
DROP TABLE IF EXISTS ordinateurs;
DROP TABLE IF EXISTS utilisateurs;

CREATE TABLE utilisateurs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    trigramme VARCHAR(10) NOT NULL UNIQUE,
    prenom VARCHAR(100) NOT NULL,
    nom VARCHAR(100) NOT NULL,
    samaccountname VARCHAR(100) NOT NULL UNIQUE,
    mot_de_passe VARCHAR(255) DEFAULT NULL,
    mobile VARCHAR(50) DEFAULT NULL,
    type_utilisateur VARCHAR(50) DEFAULT 'Employé',
    activite ENUM('Actif', 'Inactif') DEFAULT 'Actif',
    `Glo_Stagiaire` BIT(1) DEFAULT 0,
    `Glo_ServiceInfo` BIT(1) DEFAULT 0,
    `Glo_Commercial` BIT(1) DEFAULT 0,
    `Glo_Direction` BIT(1) DEFAULT 0,
    `Glo_Symetrie` BIT(1) DEFAULT 0,
    `Glo_Comptabilite` BIT(1) DEFAULT 0,
    `Glo_Production` BIT(1) DEFAULT 0,
    `Glo_RH` BIT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =============================================================
-- TABLE: ordinateurs
-- =============================================================
CREATE TABLE ordinateurs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL UNIQUE,
    systeme_exploitation VARCHAR(100) DEFAULT NULL,
    version VARCHAR(50) DEFAULT NULL,
    type ENUM('Station', 'Serveur', 'Portable', 'Autre') DEFAULT 'Station',
    utilisateur_id INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE SET NULL
);

-- =============================================================
-- TABLE: telephones
-- =============================================================
CREATE TABLE telephones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    poste VARCHAR(20) NOT NULL,
    lignes_internes VARCHAR(100) DEFAULT NULL,
    utilisateur_id INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE SET NULL
);

-- =============================================================
-- DONNÉES FICTIVES: utilisateurs
-- =============================================================
INSERT INTO utilisateurs (trigramme, prenom, nom, samaccountname, mot_de_passe, mobile, type_utilisateur, activite, `Glo_Stagiaire`, `Glo_ServiceInfo`, `Glo_Commercial`, `Glo_Direction`, `Glo_Symetrie`, `Glo_Comptabilite`, `Glo_Production`, `Glo_RH`) VALUES
-- Direction Prioritaire
('GDI', 'Gilles', 'Dio', 'gdio', NULL, '06 10 20 30 40', 'Direction', 'Actif', 0, 0, 0, 1, 1, 0, 0, 0),
('OLA', 'Olivier', 'Lap', 'olap', NULL, '06 20 30 40 50', 'Direction', 'Actif', 0, 0, 0, 1, 1, 0, 0, 0),
('TRO', 'Thierry', 'Rou', 'trou', NULL, '06 30 40 50 60', 'Direction', 'Actif', 0, 0, 0, 1, 1, 0, 0, 0),

-- Direction
('JDU', 'Jean', 'Dupont', 'jdupont', NULL, '06 12 34 56 78', 'Direction', 'Actif', 0, 0, 0, 1, 1, 0, 0, 0),
('MMA', 'Marie', 'Martin', 'mmartin', NULL, '06 98 76 54 32', 'Direction', 'Actif', 0, 0, 0, 1, 1, 0, 0, 1),

-- Service Informatique
('PLB', 'Pierre', 'Lebon', 'plebon', NULL, '06 11 22 33 44', 'Employé', 'Actif', 0, 1, 0, 0, 1, 0, 0, 0),
('SRO', 'Sophie', 'Roux', 'sroux', NULL, '06 55 66 77 88', 'Employé', 'Actif', 0, 1, 0, 0, 1, 0, 0, 0),
('TGA', 'Thomas', 'Garcia', 'tgarcia', NULL, '06 99 88 77 66', 'Employé', 'Actif', 0, 1, 0, 0, 1, 0, 0, 0),

-- Commercial
('LBE', 'Lucie', 'Bernard', 'lbernard', NULL, '06 44 33 22 11', 'Employé', 'Actif', 0, 0, 1, 0, 1, 0, 0, 0),
('AMO', 'Antoine', 'Moreau', 'amoreau', NULL, '06 77 88 99 00', 'Employé', 'Actif', 0, 0, 1, 0, 1, 0, 0, 0),
('CGI', 'Claire', 'Girard', 'cgirard', NULL, '06 22 33 44 55', 'Employé', 'Actif', 0, 0, 1, 0, 1, 0, 0, 0),
('NPE', 'Nicolas', 'Petit', 'npetit', NULL, '06 66 55 44 33', 'Employé', 'Inactif', 0, 0, 1, 0, 1, 0, 0, 0),

-- Comptabilité
('ELE', 'Emma', 'Lefebvre', 'elefebvre', NULL, '06 11 99 88 77', 'Employé', 'Actif', 0, 0, 0, 0, 1, 1, 0, 0),
('HRI', 'Hugo', 'Richard', 'hrichard', NULL, '06 33 44 55 66', 'Employé', 'Actif', 0, 0, 0, 0, 1, 1, 0, 0),

-- Production
('JFO', 'Julie', 'Fontaine', 'jfontaine', NULL, '06 88 99 00 11', 'Employé', 'Actif', 0, 0, 0, 0, 1, 0, 1, 0),
('MDU', 'Maxime', 'Durand', 'mdurand', NULL, '06 22 11 00 99', 'Employé', 'Actif', 0, 0, 0, 0, 1, 0, 1, 0),
('ABL', 'Alice', 'Blanc', 'ablanc', NULL, '06 44 55 66 77', 'Employé', 'Actif', 0, 0, 0, 0, 1, 0, 1, 0),
('VBO', 'Vincent', 'Bonnet', 'vbonnet', NULL, NULL, 'Employé', 'Actif', 0, 0, 0, 0, 1, 0, 1, 0),

-- RH
('ICH', 'Isabelle', 'Chevalier', 'ichevalier', NULL, '06 55 44 33 22', 'Employé', 'Actif', 0, 0, 0, 0, 1, 0, 0, 1),

-- Stagiaires
('KDA', 'Kevin', 'David', 'kdavid', NULL, '06 77 66 55 44', 'Stagiaire', 'Actif', 1, 1, 0, 0, 1, 0, 0, 0),
('LRO', 'Laura', 'Robert', 'lrobert', NULL, '06 88 77 66 55', 'Stagiaire', 'Actif', 1, 0, 1, 0, 1, 0, 0, 0),
('YMI', 'Yann', 'Michel', 'ymichel', NULL, NULL, 'Stagiaire', 'Inactif', 1, 0, 0, 0, 1, 0, 1, 0),

-- Autres (Comptes de service / Non-utilisateurs)
('A1', '', '', 'scan_copieur', NULL, NULL, 'Autre', 'Actif', 0, 0, 0, 0, 1, 0, 0, 0),
('A2', '', '', 'admin_db', NULL, NULL, 'Autre', 'Actif', 0, 1, 0, 0, 1, 0, 0, 0),
('A3', '', '', 'test_acc', NULL, NULL, 'Autre', 'Inactif', 0, 0, 0, 0, 0, 0, 0, 0),

-- 30 Utilisateurs supplémentaires (IDs 26 à 55)
('BMA', 'Baptiste', 'Martin', 'bmartin', NULL, '06 00 00 00 01', 'Employé', 'Actif', 0, 0, 1, 0, 1, 0, 0, 0),
('CBE', 'Chloé', 'Bernard', 'cbernard', NULL, '06 00 00 00 02', 'Employé', 'Actif', 0, 0, 0, 0, 1, 1, 0, 0),
('DDU', 'David', 'Dubois', 'ddubois', NULL, '06 00 00 00 03', 'Employé', 'Actif', 0, 0, 0, 0, 1, 0, 1, 0),
('EPE', 'Emilie', 'Petit', 'epetit', NULL, '06 00 00 00 04', 'Employé', 'Actif', 0, 0, 0, 0, 1, 0, 1, 0),
('FRO', 'Fabien', 'Roux', 'froux', NULL, '06 00 00 00 05', 'Employé', 'Actif', 0, 0, 0, 0, 1, 0, 1, 0),
('GFO', 'Gilles', 'Fournier', 'gfournier', NULL, '06 00 00 00 06', 'Employé', 'Actif', 0, 0, 0, 0, 1, 0, 1, 0),
('HMO', 'Helene', 'Morel', 'hmorel', NULL, '06 00 00 00 07', 'Employé', 'Actif', 0, 0, 0, 0, 1, 0, 0, 1),
('ISI', 'Ismael', 'Simon', 'isimon', NULL, '06 00 00 00 08', 'Employé', 'Actif', 0, 1, 0, 0, 1, 0, 0, 0),
('JLA', 'Julie', 'Laurent', 'jlaurent', NULL, '06 00 00 00 09', 'Employé', 'Actif', 0, 0, 1, 0, 1, 0, 0, 0),
('KLE', 'Karim', 'Lefevre', 'klefevre', NULL, '06 00 00 00 10', 'Employé', 'Actif', 0, 0, 0, 0, 1, 1, 0, 0),
('LMI', 'Lea', 'Michel', 'lmichel', NULL, '06 00 00 00 11', 'Employé', 'Actif', 0, 0, 0, 0, 1, 0, 1, 0),
('MGA', 'Marc', 'Garcia', 'mgarcia2', NULL, '06 00 00 00 12', 'Employé', 'Actif', 0, 0, 0, 0, 1, 0, 1, 0),
('NDA', 'Nadia', 'David', 'ndavid2', NULL, '06 00 00 00 13', 'Employé', 'Actif', 0, 0, 0, 0, 1, 0, 1, 0),
('OBE', 'Olivier', 'Bertin', 'obertin', NULL, '06 00 00 00 14', 'Employé', 'Inactif', 0, 0, 0, 0, 1, 0, 1, 0),
('PVI', 'Pauline', 'Vincent', 'pvincent', NULL, '06 00 00 00 15', 'Employé', 'Actif', 0, 0, 1, 0, 1, 0, 0, 0),
('QCO', 'Quentin', 'Colin', 'qcolin', NULL, '06 00 00 00 16', 'Employé', 'Actif', 0, 0, 1, 0, 1, 0, 0, 0),
('RLE', 'Rachel', 'Leblanc', 'rleblanc', NULL, '06 00 00 00 17', 'Employé', 'Actif', 0, 0, 0, 0, 1, 1, 0, 0),
('SMA', 'Samuel', 'Marchand', 'smarchand', NULL, '06 00 00 00 18', 'Employé', 'Actif', 0, 0, 0, 0, 1, 0, 1, 0),
('TGR', 'Thibault', 'Garnier', 'tgarnier', NULL, '06 00 00 00 19', 'Employé', 'Actif', 0, 0, 0, 0, 1, 0, 1, 0),
('UFA', 'Ulysse', 'Faure', 'ufaures', NULL, '06 00 00 00 20', 'Employé', 'Actif', 0, 0, 0, 0, 1, 0, 1, 0),
('VRO', 'Valerie', 'Rollin', 'vrollin', NULL, '06 00 00 00 21', 'Employé', 'Actif', 0, 0, 0, 0, 1, 0, 0, 1),
('WPI', 'William', 'Picard', 'wpicard', NULL, '06 00 00 00 22', 'Employé', 'Actif', 0, 1, 0, 0, 1, 0, 0, 0),
('XBO', 'Xavier', 'Boucher', 'xboucher', NULL, '06 00 00 00 23', 'Employé', 'Actif', 0, 0, 1, 0, 1, 0, 0, 0),
('YRE', 'Yasmine', 'Renard', 'yrenard', NULL, '06 00 00 00 24', 'Employé', 'Actif', 0, 0, 1, 0, 1, 0, 0, 0),
('ZLE', 'Zoe', 'Lemaire', 'zlemaire', NULL, '06 00 00 00 25', 'Employé', 'Actif', 0, 0, 0, 0, 1, 1, 0, 0),
('AME', 'Arthur', 'Meyer', 'ameyer', NULL, '06 00 00 00 26', 'Employé', 'Actif', 0, 0, 0, 0, 1, 0, 1, 0),
('BBL', 'Bastien', 'Blanc', 'bblanc2', NULL, '06 00 00 00 27', 'Employé', 'Actif', 0, 0, 0, 0, 1, 0, 1, 0),
('CGA', 'Celine', 'Gaillard', 'cgaillard', NULL, '06 00 00 00 28', 'Employé', 'Actif', 0, 0, 0, 0, 1, 0, 1, 0),
('DME', 'Damien', 'Meunier', 'dmeunier', NULL, '06 00 00 00 29', 'Stagiaire', 'Actif', 1, 0, 1, 0, 1, 0, 0, 0),
('ELO', 'Elena', 'Leroy', 'eleroy', NULL, '06 00 00 00 30', 'Stagiaire', 'Actif', 1, 0, 0, 0, 1, 0, 1, 0);

-- =============================================================
-- COMPTES DÉMO
-- =============================================================
INSERT INTO utilisateurs (trigramme, prenom, nom, samaccountname, mot_de_passe, mobile, type_utilisateur, activite, `Glo_Stagiaire`, `Glo_ServiceInfo`, `Glo_Commercial`, `Glo_Direction`, `Glo_Symetrie`, `Glo_Comptabilite`, `Glo_Production`, `Glo_RH`) VALUES
('DLE', 'Compte', 'Lecture', 'DemoLecture', '$2b$10$jggnJXHvNRfjtc8biI9LVO4AzKX6PvgPhhEhJohLzNbznnwn4U8u.', NULL, 'Employé', 'Actif', 0, 0, 0, 0, 1, 0, 0, 0),
('DAD', 'Compte', 'Admin', 'DemoAdmin', '$2b$10$jggnJXHvNRfjtc8biI9LVO4AzKX6PvgPhhEhJohLzNbznnwn4U8u.', NULL, 'Direction', 'Actif', 0, 1, 0, 1, 1, 0, 0, 0);

-- =============================================================
-- DONNÉES FICTIVES: ordinateurs
-- =============================================================
INSERT INTO ordinateurs (nom, systeme_exploitation, version, type, utilisateur_id) VALUES
-- Stations assignées
('PC-DIR-001', 'Windows 11', '23H2', 'Station', 1),
('PC-DIR-002', 'Windows 11', '23H2', 'Station', 2),
('PC-SI-001', 'Windows 11', '23H2', 'Station', 3),
('PC-SI-002', 'Windows 11', '23H2', 'Station', 4),
('PC-SI-003', 'Ubuntu', '24.04 LTS', 'Station', 5),
('PC-COM-001', 'Windows 11', '23H2', 'Station', 6),
('PC-COM-002', 'Windows 10', '22H2', 'Station', 7),
('PC-COM-003', 'Windows 11', '23H2', 'Station', 8),
('PC-COMPTA-001', 'Windows 11', '23H2', 'Station', 10),
('PC-COMPTA-002', 'Windows 10', '22H2', 'Station', 11),
('PC-PROD-001', 'Windows 10', '22H2', 'Station', 12),
('PC-PROD-002', 'Windows 10', '22H2', 'Station', 13),
('PC-PROD-003', 'Windows 11', '23H2', 'Station', 14),
('PC-RH-001', 'Windows 11', '23H2', 'Station', 16),
('PC-STAGE-001', 'Windows 10', '22H2', 'Station', 17),

-- Stations non assignées (libres)
('PC-SPARE-001', 'Windows 11', '23H2', 'Station', NULL),
('PC-SPARE-002', 'Windows 10', '22H2', 'Station', NULL),
('PC-SPARE-003', 'Windows 11', '23H2', 'Station', NULL),
('PC-SPARE-004', 'Ubuntu', '22.04 LTS', 'Station', NULL),
('PC-SPARE-005', NULL, NULL, 'Station', NULL),

-- Portables
('LAPTOP-DIR-001', 'Windows 11', '23H2', 'Portable', 1),
('LAPTOP-COM-001', 'Windows 11', '23H2', 'Portable', 6),
('LAPTOP-COM-002', 'macOS', 'Sonoma 14', 'Portable', 7),
('LAPTOP-SI-001', 'Ubuntu', '24.04 LTS', 'Portable', 3),
('LAPTOP-SPARE-001', 'Windows 11', '23H2', 'Portable', NULL),

-- Serveurs
('SRV-DC-001', 'Windows Server', '2022', 'Serveur', NULL),
('SRV-DC-002', 'Windows Server', '2022', 'Serveur', NULL),
('SRV-FILE-001', 'Windows Server', '2019', 'Serveur', NULL),
('SRV-WEB-001', 'Ubuntu Server', '22.04 LTS', 'Serveur', NULL),
('SRV-DB-001', 'CentOS', '8 Stream', 'Serveur', NULL),
('SRV-BACKUP-001', 'Debian', '12', 'Serveur', NULL),

-- 30 Ordinateurs supplémentaires (assignés aux nouveaux)
('PC-COM-004', 'Windows 11', '23H2', 'Station', 26),
('PC-COMPTA-003', 'Windows 10', '22H2', 'Station', 27),
('PC-PROD-004', 'Windows 11', '23H2', 'Station', 28),
('PC-PROD-005', 'Windows 10', '22H2', 'Station', 29),
('PC-PROD-006', 'Windows 11', '23H2', 'Station', 30),
('PC-PROD-007', 'Ubuntu', '24.04 LTS', 'Station', 31),
('PC-RH-002', 'Windows 11', '23H2', 'Station', 32),
('LAPTOP-SI-002', 'macOS', 'Sonoma 14', 'Portable', 33),
('LAPTOP-COM-003', 'Windows 11', '23H2', 'Portable', 34),
('PC-COMPTA-004', 'Windows 11', '23H2', 'Station', 35),
('PC-PROD-008', 'Windows 11', '23H2', 'Station', 36),
('PC-PROD-009', 'Windows 10', '22H2', 'Station', 37),
('PC-PROD-010', 'Windows 11', '23H2', 'Station', 38),
('PC-PROD-011', 'Windows 11', '23H2', 'Station', 39),
('LAPTOP-COM-004', 'Windows 11', '23H2', 'Portable', 40),
('LAPTOP-COM-005', 'macOS', 'Sonoma 14', 'Portable', 41),
('PC-COMPTA-005', 'Windows 11', '23H2', 'Station', 42),
('PC-PROD-012', 'Windows 11', '23H2', 'Station', 43),
('PC-PROD-013', 'Windows 10', '22H2', 'Station', 44),
('PC-PROD-014', 'Windows 11', '23H2', 'Station', 45),
('PC-RH-003', 'Windows 11', '23H2', 'Station', 46),
('LAPTOP-SI-003', 'Ubuntu', '24.04 LTS', 'Portable', 47),
('LAPTOP-COM-006', 'Windows 11', '23H2', 'Portable', 48),
('LAPTOP-COM-007', 'Windows 11', '23H2', 'Portable', 49),
('PC-COMPTA-006', 'Windows 11', '23H2', 'Station', 50),
('PC-PROD-015', 'Windows 10', '22H2', 'Station', 51),
('PC-PROD-016', 'Windows 11', '23H2', 'Station', 52),
('PC-PROD-017', 'Windows 11', '23H2', 'Station', 53),
('LAPTOP-STAGE-001', 'Windows 11', '23H2', 'Portable', 54),
('PC-STAGE-002', 'Windows 10', '22H2', 'Station', 55);

-- =============================================================
-- DONNÉES FICTIVES: telephones
-- =============================================================
INSERT INTO telephones (poste, lignes_internes, utilisateur_id) VALUES
-- Direction Prioritaire (GDI, OLA, TRO => 1, 2, 3)
('10', '04 66 11 22 33', 1),
('11', '04 66 11 22 34', 2),
('12', '04 66 11 22 35', 3),

-- Direction (JDU, MMA => 4, 5)
('13', '04 66 11 22 36', 4),
('14', '04 66 11 22 37', 5),

-- Service Info (6, 7, 8)
('20', '04 66 11 22 40', 6),
('21', '04 66 11 22 41', 7),
('22', '04 66 11 22 42', 8),

-- Commercial (9, 10, 11, 12)
('30', '04 66 11 22 50', 9),
('31', '04 66 11 22 51', 10),
('32', '04 66 11 22 52', 11),

-- Comptabilité (13, 14)
('40', '04 66 11 22 60', 13),
('41', '04 66 11 22 61', 14),

-- Production (15, 16, 17, 18)
('50', '04 66 11 22 70', 15),
('51', '04 66 11 22 71', 16),
('52', '04 66 11 22 72', 17),
('53', '04 66 11 22 73', 18),

-- RH (19)
('60', '04 66 11 22 80', 19),

-- Postes non assignés (salle de réunion, accueil, etc.)
('90', '04 66 11 22 90', NULL),
('91', '04 66 11 22 91', NULL),
('92', '04 66 11 22 92', NULL);

-- =============================================================
-- INDEX pour améliorer les performances
-- =============================================================
CREATE INDEX idx_utilisateurs_activite ON utilisateurs(activite);
CREATE INDEX idx_ordinateurs_type ON ordinateurs(type);
CREATE INDEX idx_ordinateurs_utilisateur ON ordinateurs(utilisateur_id);
CREATE INDEX idx_telephones_utilisateur ON telephones(utilisateur_id);

-- =============================================================
-- Vérification
-- =============================================================
SELECT 'Base de données initialisée avec succès!' AS status;
SELECT COUNT(*) AS nb_utilisateurs FROM utilisateurs;
SELECT COUNT(*) AS nb_ordinateurs FROM ordinateurs;
SELECT COUNT(*) AS nb_telephones FROM telephones;
