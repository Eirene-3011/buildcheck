-- BuildCheck Monitor — MySQL schema
-- Run via PHPMyAdmin: select database `buildcheck_monitor` and Import this file.

CREATE DATABASE IF NOT EXISTS buildcheck_monitor
  CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE buildcheck_monitor;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS violations;
DROP TABLE IF EXISTS photos;
DROP TABLE IF EXISTS environmental;
DROP TABLE IF EXISTS safety_risk;
DROP TABLE IF EXISTS safety_general;
DROP TABLE IF EXISTS equipment;
DROP TABLE IF EXISTS manpower;
DROP TABLE IF EXISTS activities;
DROP TABLE IF EXISTS inspections;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS locations;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- ===== Locations (CvSU campuses / colleges) =====
CREATE TABLE locations (
  id    INT AUTO_INCREMENT PRIMARY KEY,
  name  VARCHAR(120) NOT NULL UNIQUE
) ENGINE=InnoDB;

INSERT INTO locations (name) VALUES
('Main Campus'),('Research'),('CAFENR'),('CAS'),('CED'),('CEMDS'),
('CEIT'),('CON'),('COM'),('CSPEAR'),('CVMBS'),('CCJ'),
('Graduate School'),('Bacoor City Campus'),('Cavite City Campus'),
('Imus Campus'),('Silang Campus'),('Carmona Campus'),
('Rosario Campus'),('Naic Campus'),('General Trias Campus'),
('Tanza Campus'),('Trece Martires Campus'),('Maragondon Campus');

-- ===== Users =====
CREATE TABLE users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(120) NOT NULL,
  email         VARCHAR(160) NOT NULL UNIQUE,
  password      VARCHAR(255) NOT NULL,
  role          ENUM('admin','inspector') NOT NULL DEFAULT 'inspector',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_users_role (role)
) ENGINE=InnoDB;

-- ===== Projects =====
CREATE TABLE projects (
  id                       INT AUTO_INCREMENT PRIMARY KEY,
  year                     SMALLINT NOT NULL,
  ref_number               VARCHAR(40) NOT NULL,
  name                     VARCHAR(200) NOT NULL,
  location_id              INT NOT NULL,
  funding_source           VARCHAR(160) NOT NULL,
  approved_budget          DECIMAL(15,2) NOT NULL,
  contract_amount          DECIMAL(15,2) NOT NULL,
  variation_orders         DECIMAL(15,2) NOT NULL DEFAULT 0,
  revised_contract_amount  DECIMAL(15,2) NOT NULL,
  contractor               VARCHAR(160) NOT NULL,
  person_in_charge         VARCHAR(120) NOT NULL,
  mode_of_procurement      ENUM('Public Bidding','Small Value Procurement','Shopping','Negotiated Procurement','Direct Contracting','Repeat Order','Limited Source Bidding') NOT NULL,
  project_status           ENUM('Ongoing','Completed','Suspended','Terminated','Pending') NOT NULL DEFAULT 'Ongoing',
  duration                 VARCHAR(80) NOT NULL,
  start_date               DATE NOT NULL,
  target_completion_date   DATE NOT NULL,
  revised_expiry_date      DATE NOT NULL,
  created_by               INT NOT NULL,
  created_at               TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_projects_user FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_projects_loc  FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE RESTRICT,
  INDEX idx_projects_created_by (created_by),
  INDEX idx_projects_location (location_id),
  INDEX idx_projects_status (project_status),
  INDEX idx_projects_start (start_date)
) ENGINE=InnoDB;

-- ===== Inspections =====
CREATE TABLE inspections (
  id                   INT AUTO_INCREMENT PRIMARY KEY,
  project_id           INT NOT NULL,
  inspector_id         INT NOT NULL,
  inspection_datetime  DATETIME NOT NULL,
  weather              VARCHAR(40) NOT NULL,
  weather_other        VARCHAR(120) DEFAULT NULL,
  site_cleanliness     ENUM('Very Clean','Clean','Acceptable','Needs Improvement','Poor') NOT NULL,
  compliance_status    ENUM('Fully Compliant','Partially Compliant','Non-Compliant','Under Review') NOT NULL,
  compliance_remarks   TEXT,
  overall_assessment   ENUM('Excellent','Good','Acceptable','Needs Immediate Attention','Unsafe Condition') NOT NULL,
  status               ENUM('Completed','Pending','Overdue') NOT NULL DEFAULT 'Completed',
  created_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_insp_project   FOREIGN KEY (project_id)   REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT fk_insp_inspector FOREIGN KEY (inspector_id) REFERENCES users(id)    ON DELETE RESTRICT,
  INDEX idx_insp_project (project_id),
  INDEX idx_insp_datetime (inspection_datetime),
  INDEX idx_insp_status (status)
) ENGINE=InnoDB;

-- ===== Activities (multi) =====
CREATE TABLE activities (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  inspection_id INT NOT NULL,
  activity_name VARCHAR(120) NOT NULL,
  CONSTRAINT fk_act_insp FOREIGN KEY (inspection_id) REFERENCES inspections(id) ON DELETE CASCADE,
  INDEX idx_act_insp (inspection_id)
) ENGINE=InnoDB;

-- ===== Manpower =====
CREATE TABLE manpower (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  inspection_id INT NOT NULL,
  category      VARCHAR(80) NOT NULL,
  count         INT NOT NULL,
  CONSTRAINT fk_mp_insp FOREIGN KEY (inspection_id) REFERENCES inspections(id) ON DELETE CASCADE,
  INDEX idx_mp_insp (inspection_id)
) ENGINE=InnoDB;

-- ===== Equipment =====
CREATE TABLE equipment (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  inspection_id INT NOT NULL,
  `condition`   ENUM('Excellent','Good','Functional','Needs Maintenance','Under Repair','Out of Service') NOT NULL,
  remarks       TEXT,
  CONSTRAINT fk_eq_insp FOREIGN KEY (inspection_id) REFERENCES inspections(id) ON DELETE CASCADE,
  INDEX idx_eq_insp (inspection_id)
) ENGINE=InnoDB;

-- ===== Safety: General =====
CREATE TABLE safety_general (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  inspection_id INT NOT NULL,
  item          VARCHAR(160) NOT NULL,
  status        ENUM('Compliant','Partially Compliant','Non-Compliant') NOT NULL,
  remarks       TEXT,
  CONSTRAINT fk_sg_insp FOREIGN KEY (inspection_id) REFERENCES inspections(id) ON DELETE CASCADE,
  INDEX idx_sg_insp (inspection_id)
) ENGINE=InnoDB;

-- ===== Safety: Risk =====
CREATE TABLE safety_risk (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  inspection_id INT NOT NULL,
  risk_type     VARCHAR(160) NOT NULL,
  risk_level    ENUM('Low','Moderate','High','Critical') NOT NULL,
  measures      TEXT,
  CONSTRAINT fk_sr_insp FOREIGN KEY (inspection_id) REFERENCES inspections(id) ON DELETE CASCADE,
  INDEX idx_sr_insp (inspection_id),
  INDEX idx_sr_level (risk_level)
) ENGINE=InnoDB;

-- ===== Environmental =====
CREATE TABLE environmental (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  inspection_id INT NOT NULL,
  item          VARCHAR(160) NOT NULL,
  status        ENUM('Satisfactory','Needs Improvement','Unsatisfactory') NOT NULL,
  remarks       TEXT,
  CONSTRAINT fk_env_insp FOREIGN KEY (inspection_id) REFERENCES inspections(id) ON DELETE CASCADE,
  INDEX idx_env_insp (inspection_id)
) ENGINE=InnoDB;

-- ===== Photos =====
CREATE TABLE photos (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  inspection_id INT NOT NULL,
  file_path     VARCHAR(255) NOT NULL,
  uploaded_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_ph_insp FOREIGN KEY (inspection_id) REFERENCES inspections(id) ON DELETE CASCADE,
  INDEX idx_ph_insp (inspection_id)
) ENGINE=InnoDB;

-- ===== Violations =====
CREATE TABLE violations (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  inspection_id       INT NOT NULL,
  description         TEXT NOT NULL,
  corrective_action   TEXT NOT NULL,
  contractor_remarks  TEXT,
  acknowledged        TINYINT(1) NOT NULL DEFAULT 0,
  acknowledged_at     TIMESTAMP NULL DEFAULT NULL,
  created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_vi_insp FOREIGN KEY (inspection_id) REFERENCES inspections(id) ON DELETE CASCADE,
  INDEX idx_vi_insp (inspection_id),
  INDEX idx_vi_ack (acknowledged)
) ENGINE=InnoDB;

-- ===== Seed users =====
-- bcrypt hashes (10 rounds) for the documented default passwords:
--   Admin@123     -> below
--   Inspector@123 -> below
INSERT INTO users (name, email, password, role) VALUES
('System Administrator', 'admin@buildcheck.com',
 '$2b$10$BXv3nXWDGWzjn7/KdPPMyOCgK03CS2V/Mh6ZM7kidBGFGKcrLZJSi', 'admin'),
('Field Inspector', 'inspector@buildcheck.com',
 '$2b$10$jY.tS9lolYpxiVGfSFdYPuSuCBlpTUbBujajXMg6WXEnCM8Nt9m0G', 'inspector');

-- Pre-seeded inspector roster (from the provided spreadsheet "Inspectors" sheet).
-- All share the same default password: Inspector@123
INSERT INTO users (name, email, password, role) VALUES
('Trisha Marie I. Juliano',  'tjuliano@buildcheck.com',  '$2b$10$jY.tS9lolYpxiVGfSFdYPuSuCBlpTUbBujajXMg6WXEnCM8Nt9m0G', 'inspector'),
('Lordley M. Abellar',       'labellar@buildcheck.com',  '$2b$10$jY.tS9lolYpxiVGfSFdYPuSuCBlpTUbBujajXMg6WXEnCM8Nt9m0G', 'inspector'),
('Sancho B. Bayot, Jr.',     'sbayot@buildcheck.com',    '$2b$10$jY.tS9lolYpxiVGfSFdYPuSuCBlpTUbBujajXMg6WXEnCM8Nt9m0G', 'inspector'),
('Elpidio N. Roderos, Jr.',  'eroderos@buildcheck.com',  '$2b$10$jY.tS9lolYpxiVGfSFdYPuSuCBlpTUbBujajXMg6WXEnCM8Nt9m0G', 'inspector'),
('Arturo L. Bago',           'abago@buildcheck.com',     '$2b$10$jY.tS9lolYpxiVGfSFdYPuSuCBlpTUbBujajXMg6WXEnCM8Nt9m0G', 'inspector'),
('Ryan Janssen R. Sanchez',  'rsanchez@buildcheck.com',  '$2b$10$jY.tS9lolYpxiVGfSFdYPuSuCBlpTUbBujajXMg6WXEnCM8Nt9m0G', 'inspector'),
('Rowmar Joshua M. Pascual', 'rpascual@buildcheck.com',  '$2b$10$jY.tS9lolYpxiVGfSFdYPuSuCBlpTUbBujajXMg6WXEnCM8Nt9m0G', 'inspector'),
('Marnellie N. Gatdula',     'mgatdula@buildcheck.com',  '$2b$10$jY.tS9lolYpxiVGfSFdYPuSuCBlpTUbBujajXMg6WXEnCM8Nt9m0G', 'inspector'),
('Juan N. Rodil',            'jrodil@buildcheck.com',    '$2b$10$jY.tS9lolYpxiVGfSFdYPuSuCBlpTUbBujajXMg6WXEnCM8Nt9m0G', 'inspector'),
('Janelle D. Adsuara',       'jadsuara@buildcheck.com',  '$2b$10$jY.tS9lolYpxiVGfSFdYPuSuCBlpTUbBujajXMg6WXEnCM8Nt9m0G', 'inspector');
