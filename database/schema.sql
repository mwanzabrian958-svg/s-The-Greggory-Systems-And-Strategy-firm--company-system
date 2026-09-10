-- =============================================
-- Canonical Database Schema
-- Source: scripts/.backup/local-backup-2026-09-06T12-51-14-703Z.sql
-- =============================================
-- This is the single source of truth for the database schema.
-- To initialize a fresh database:
--   1. Create the database: CREATE DATABASE the_greggory_systems_and_strategy_firm_db_main;
--   2. Run: mysql -u root -p the_greggory_systems_and_strategy_firm_db_main < database/schema.sql
-- =============================================

-- Full schema is maintained in scripts/.backup/local-backup-2026-09-06T12-51-14-703Z.sql
-- Copy the contents of that file here when making schema changes.

-- =============================================
-- Migration Tracking Table
-- =============================================
CREATE TABLE IF NOT EXISTS schema_migrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  migration_name VARCHAR(255) NOT NULL UNIQUE,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
