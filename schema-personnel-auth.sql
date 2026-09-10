-- ============================================================================
-- PERSONNEL AUTHENTICATION TABLES
-- ============================================================================
-- Run this script on BOTH databases:
--   1. Aiven Cloud MySQL (primary)
--   2. Local XAMPP MariaDB (hot standby)
--
-- This creates the personnel/employee authentication system for the Finance
-- department and other departments. Each employee gets their own login
-- credentials and role-based access to their specific UI modules.
-- ============================================================================

USE the_greggory_systems_and_strategy_firm_db_main;

-- ============================================================================
-- 0. IMAGES TABLE (Blob photo storage for employee profiles)
-- ============================================================================
-- This table stores binary image data (BLOB) for employee profile photos.
-- Employees reference their photo via profile_image_id FK.
CREATE TABLE IF NOT EXISTS images (
  id BIGINT(20) NOT NULL AUTO_INCREMENT,
  file_name VARCHAR(255) NOT NULL,
  content_type VARCHAR(100) NOT NULL DEFAULT 'image/jpeg',
  data LONGBLOB NOT NULL,
  file_size INT DEFAULT 0,
  width INT DEFAULT 0,
  height INT DEFAULT 0,
  alt_text VARCHAR(255),
  category ENUM('profile', 'logo', 'document', 'media', 'other') DEFAULT 'profile',
  uploaded_by INT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_images_category (category),
  INDEX idx_images_uploaded_by (uploaded_by),
  INDEX idx_images_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 1. DEPARTMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50) DEFAULT 'Building2',
  color VARCHAR(20) DEFAULT '#002D62',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_departments_slug (slug),
  INDEX idx_departments_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO departments (name, slug, description, icon, color) VALUES
  ('Executive', 'executive', 'Executive leadership and strategy', 'Crown', '#002D62'),
  ('Accounting & Finance', 'finance', 'Financial operations, billing, and payments', 'Calculator', '#002D62'),
  ('Human Resources', 'hr', 'Personnel management and team operations', 'UserCheck', '#002D62'),
  ('Information Technology', 'it', 'System administration and security', 'Server', '#002D62'),
  ('Marketing & Communications', 'marketing', 'Content, messaging, and outreach', 'Megaphone', '#002D62'),
  ('Project Management', 'projects', 'Project delivery and task management', 'FolderKanban', '#002D62'),
  ('Web Master', 'webmaster', 'Website management and content', 'Globe', '#002D62'),
  ('Operations', 'operations', 'Support and operational tasks', 'LifeBuoy', '#002D62')
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- ============================================================================
-- 2. EMPLOYEE ROLES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS employee_roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  department_id INT,
  access_level ENUM('limited', 'standard', 'manager', 'admin', 'super_admin') DEFAULT 'standard',
  permissions JSON,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
  INDEX idx_roles_slug (slug),
  INDEX idx_roles_department (department_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO employee_roles (name, slug, description, department_id, access_level, permissions) VALUES
  ('Finance Manager', 'finance_manager', 'Oversees all financial operations', 2, 'manager', '["view_all_finance", "approve_transactions", "manage_team", "view_reports"]'),
  ('Accounts Receivable Clerk', 'ar_clerk', 'Handles invoicing and payment tracking', 2, 'standard', '["create_invoice", "send_invoice", "view_invoices", "track_payments"]'),
  ('Accounts Payable Clerk', 'ap_clerk', 'Handles expenses and ledger entries', 2, 'standard', '["create_ledger_entry", "view_ledger", "manage_expenses"]'),
  ('Financial Analyst', 'financial_analyst', 'P&L reports and cash flow analysis', 2, 'standard', '["view_reports", "export_reports", "view_analytics"]'),
  ('Payment Processor', 'payment_processor', 'M-Pesa transactions and recording', 2, 'standard', '["record_payments", "view_transactions", "reconcile_payments"]'),
  ('HR Manager', 'hr_manager', 'Personnel management', 3, 'manager', '["view_all_personnel", "manage_team", "approve_leave"]'),
  ('IT Administrator', 'it_admin', 'System administration', 4, 'admin', '["manage_users", "manage_settings", "view_logs", "manage_security"]'),
  ('Marketing Manager', 'marketing_manager', 'Marketing operations', 5, 'manager', '["manage_content", "manage_messages", "view_analytics"]'),
  ('Project Manager', 'project_manager', 'Project delivery', 6, 'manager', '["manage_projects", "manage_tasks", "view_team"]'),
  ('Web Master', 'webmaster', 'Website management', 7, 'admin', '["manage_website", "manage_content", "manage_media"]')
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- ============================================================================
-- 3. EMPLOYEES (PERSONNEL) TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_code VARCHAR(20) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  display_name VARCHAR(200),
  phone_number VARCHAR(20),
  profile_image_id INT,
  department_id INT,
  role_id INT,
  primary_role ENUM('employee', 'manager', 'admin', 'super_admin') DEFAULT 'employee',
  is_active BOOLEAN DEFAULT TRUE,
  is_email_verified BOOLEAN DEFAULT FALSE,
  last_login_at TIMESTAMP NULL,
  last_login_ip VARCHAR(45),
  login_count INT DEFAULT 0,
  failed_login_count INT DEFAULT 0,
  locked_until TIMESTAMP NULL,
  password_reset_token VARCHAR(255),
  password_reset_expires TIMESTAMP NULL,
  session_token VARCHAR(255),
  session_expires TIMESTAMP NULL,
  timezone VARCHAR(50) DEFAULT 'Africa/Nairobi',
  locale VARCHAR(10) DEFAULT 'en-KE',
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
  FOREIGN KEY (role_id) REFERENCES employee_roles(id) ON DELETE SET NULL,
  INDEX idx_employees_email (email),
  INDEX idx_employees_code (employee_code),
  INDEX idx_employees_department (department_id),
  INDEX idx_employees_role (role_id),
  INDEX idx_employees_active (is_active),
  INDEX idx_employees_deleted (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed default Finance department employees
-- Default password for all: @Greggory2025!
INSERT INTO employees (employee_code, email, password_hash, first_name, last_name, display_name, department_id, role_id, primary_role, is_active, is_email_verified) VALUES
  ('FIN-001', 'finance.manager@greggorysystems.com', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOfMQbF7s4YoTDFDxOg7J6lA2u0Kj1Iqy', 'Grace', 'Muthoni', 'Grace Muthoni', 2, 1, 'manager', TRUE, TRUE),
  ('FIN-002', 'ar.clerk@greggorysystems.com', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOfMQbF7s4YoTDFDxOg7J6lA2u0Kj1Iqy', 'James', 'Odhiambo', 'James Odhiambo', 2, 2, 'employee', TRUE, TRUE),
  ('FIN-003', 'ap.clerk@greggorysystems.com', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOfMQbF7s4YoTDFDxOg7J6lA2u0Kj1Iqy', 'Faith', 'Wanjiku', 'Faith Wanjiku', 2, 3, 'employee', TRUE, TRUE),
  ('FIN-004', 'analyst@greggorysystems.com', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOfMQbF7s4YoTDFDxOg7J6lA2u0Kj1Iqy', 'Peter', 'Kamau', 'Peter Kamau', 2, 4, 'employee', TRUE, TRUE),
  ('FIN-005', 'payment.processor@greggorysystems.com', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOfMQbF7s4YoTDFDxOg7J6lA2u0Kj1Iqy', 'Esther', 'Njeri', 'Esther Njeri', 2, 5, 'employee', TRUE, TRUE)
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- ============================================================================
-- 4. EMPLOYEE SESSIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS employee_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  session_token VARCHAR(255) NOT NULL UNIQUE,
  ip_address VARCHAR(45),
  user_agent TEXT,
  device_info JSON,
  is_active BOOLEAN DEFAULT TRUE,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  ended_at TIMESTAMP NULL,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  INDEX idx_sessions_token (session_token),
  INDEX idx_sessions_employee (employee_id),
  INDEX idx_sessions_active (is_active),
  INDEX idx_sessions_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 5. EMPLOYEE ACTIVITY LOG TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS employee_activity_log (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id INT,
  description TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  INDEX idx_activity_employee (employee_id),
  INDEX idx_activity_action (action),
  INDEX idx_activity_entity (entity_type, entity_id),
  INDEX idx_activity_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 6. EMPLOYEE PERMISSIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS employee_permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  permission VARCHAR(100) NOT NULL,
  granted BOOLEAN DEFAULT TRUE,
  granted_by INT,
  reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY (granted_by) REFERENCES employees(id) ON DELETE SET NULL,
  UNIQUE KEY uk_employee_permission (employee_id, permission),
  INDEX idx_perm_employee (employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 7. EMPLOYEE TASK ASSIGNMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS employee_tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  task_name VARCHAR(200) NOT NULL,
  task_description TEXT,
  module_path VARCHAR(200),
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
  due_date DATE,
  completed_at TIMESTAMP NULL,
  assigned_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_by) REFERENCES employees(id) ON DELETE SET NULL,
  INDEX idx_tasks_employee (employee_id),
  INDEX idx_tasks_status (status),
  INDEX idx_tasks_priority (priority)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 8. PASSWORD RESET TOKENS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS password_resets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  INDEX idx_reset_token (token),
  INDEX idx_reset_employee (employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
