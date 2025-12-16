-- =====================================================
-- Kenya Education Heatmap - Database Schema
-- LMS Sales Platform
-- Version: 1.0.0
-- =====================================================

-- Create database
CREATE DATABASE IF NOT EXISTS kenya_lms_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE kenya_lms_db;

-- =====================================================
-- COUNTIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS counties (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) NOT NULL,
    region VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =====================================================
-- INSTITUTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS institutions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type ENUM('University', 'TVET', 'College') NOT NULL,
    sub_type VARCHAR(100), -- e.g., 'Public', 'Private', 'National Polytechnic', 'TTI', 'VTC'
    county_id INT,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    address VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(100),
    website VARCHAR(255),
    enrollment_size INT,
    established_year INT,
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (county_id) REFERENCES counties(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =====================================================
-- USERS TABLE (for sales team)
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    role ENUM('Admin', 'Manager', 'Sales Rep') DEFAULT 'Sales Rep',
    phone VARCHAR(50),
    avatar VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =====================================================
-- LEADS TABLE (institution as potential customer)
-- =====================================================
CREATE TABLE IF NOT EXISTS leads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    institution_id INT NOT NULL,
    assigned_to INT, -- user_id
    status ENUM('New', 'Contacted', 'Interested', 'Negotiating', 'Won', 'Lost') DEFAULT 'New',
    priority ENUM('Low', 'Medium', 'High', 'Hot') DEFAULT 'Medium',
    source VARCHAR(100), -- How lead was found
    estimated_value DECIMAL(12, 2), -- Potential deal value
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (institution_id) REFERENCES institutions(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =====================================================
-- CONTACTS TABLE (people at institutions)
-- =====================================================
CREATE TABLE IF NOT EXISTS contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    institution_id INT NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    title VARCHAR(100), -- e.g., 'ICT Director', 'Registrar', 'Principal'
    email VARCHAR(100),
    phone VARCHAR(50),
    is_decision_maker BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (institution_id) REFERENCES institutions(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================
-- ACTIVITIES TABLE (interactions with leads)
-- =====================================================
CREATE TABLE IF NOT EXISTS activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lead_id INT NOT NULL,
    user_id INT NOT NULL,
    type ENUM('Call', 'Email', 'Meeting', 'Demo', 'Follow-up', 'Note') NOT NULL,
    subject VARCHAR(255),
    description TEXT,
    activity_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    next_action VARCHAR(255),
    next_action_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================
-- TAGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    color VARCHAR(7) DEFAULT '#3498DB', -- Hex color
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =====================================================
-- INSTITUTION_TAGS (Many-to-Many)
-- =====================================================
CREATE TABLE IF NOT EXISTS institution_tags (
    institution_id INT NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY (institution_id, tag_id),
    FOREIGN KEY (institution_id) REFERENCES institutions(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================
-- INDEXES for better performance
-- =====================================================
CREATE INDEX idx_institutions_county ON institutions(county_id);
CREATE INDEX idx_institutions_type ON institutions(type);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_assigned ON leads(assigned_to);
CREATE INDEX idx_activities_lead ON activities(lead_id);
CREATE INDEX idx_activities_date ON activities(activity_date);

-- =====================================================
-- INSERT DEFAULT DATA
-- =====================================================

-- Insert Counties
INSERT INTO counties (name, code, region) VALUES
('Mombasa', '001', 'Coast'),
('Kwale', '002', 'Coast'),
('Kilifi', '003', 'Coast'),
('Tana River', '004', 'Coast'),
('Lamu', '005', 'Coast'),
('Taita Taveta', '006', 'Coast'),
('Garissa', '007', 'North Eastern'),
('Wajir', '008', 'North Eastern'),
('Mandera', '009', 'North Eastern'),
('Marsabit', '010', 'Eastern'),
('Isiolo', '011', 'Eastern'),
('Meru', '012', 'Eastern'),
('Tharaka-Nithi', '013', 'Eastern'),
('Embu', '014', 'Eastern'),
('Kitui', '015', 'Eastern'),
('Machakos', '016', 'Eastern'),
('Makueni', '017', 'Eastern'),
('Nyandarua', '018', 'Central'),
('Nyeri', '019', 'Central'),
('Kirinyaga', '020', 'Central'),
('Murang''a', '021', 'Central'),
('Kiambu', '022', 'Central'),
('Turkana', '023', 'Rift Valley'),
('West Pokot', '024', 'Rift Valley'),
('Samburu', '025', 'Rift Valley'),
('Trans Nzoia', '026', 'Rift Valley'),
('Uasin Gishu', '027', 'Rift Valley'),
('Elgeyo-Marakwet', '028', 'Rift Valley'),
('Nandi', '029', 'Rift Valley'),
('Baringo', '030', 'Rift Valley'),
('Laikipia', '031', 'Rift Valley'),
('Nakuru', '032', 'Rift Valley'),
('Narok', '033', 'Rift Valley'),
('Kajiado', '034', 'Rift Valley'),
('Kericho', '035', 'Rift Valley'),
('Bomet', '036', 'Rift Valley'),
('Kakamega', '037', 'Western'),
('Vihiga', '038', 'Western'),
('Bungoma', '039', 'Western'),
('Busia', '040', 'Western'),
('Siaya', '041', 'Nyanza'),
('Kisumu', '042', 'Nyanza'),
('Homa Bay', '043', 'Nyanza'),
('Migori', '044', 'Nyanza'),
('Kisii', '045', 'Nyanza'),
('Nyamira', '046', 'Nyanza'),
('Nairobi', '047', 'Nairobi');

-- Insert default admin user (password: admin123 - CHANGE IN PRODUCTION!)
INSERT INTO users (username, email, password, full_name, role) VALUES
('admin', 'admin@kenyaheatmap.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System Administrator', 'Admin');

-- Insert default tags
INSERT INTO tags (name, color) VALUES
('Hot Lead', '#E74C3C'),
('Interested', '#F39C12'),
('Has LMS', '#9B59B6'),
('No Budget', '#95A5A6'),
('Decision Pending', '#3498DB'),
('Follow Up', '#2ECC71'),
('Government Funded', '#1ABC9C'),
('Private', '#E67E22');

-- =====================================================
-- END OF SCHEMA
-- =====================================================
