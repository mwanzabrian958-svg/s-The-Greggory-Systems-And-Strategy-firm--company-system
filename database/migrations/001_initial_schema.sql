-- Migration: 001_initial_schema
-- Date: 2026-09-06
-- Description: Initial schema baseline (migration tracking + core lookup tables).

-- Creates the migration tracking table (if not already present).
-- The runner (backend/migrate.js) also ensures this table exists, so this is
-- idempotent whether run via the runner or manually.

CREATE TABLE IF NOT EXISTS schema_migrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  migration_name VARCHAR(255) NOT NULL UNIQUE,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Mark this migration as applied. INSERT IGNORE keeps it safe to re-run.
INSERT IGNORE INTO schema_migrations (migration_name) VALUES ('001_initial_schema');
