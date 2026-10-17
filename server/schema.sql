-- Local SQLite schema. Applied automatically by server/server.js on startup.
-- Mirrors supabase/sql/contacts.sql, plus a table for Experience registrations.

CREATE TABLE IF NOT EXISTS contacts (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  message    TEXT,
  ip_hash    TEXT,
  source     TEXT NOT NULL DEFAULT 'contact_form',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS idx_contacts_ip_created ON contacts (ip_hash, created_at);

-- Return to You Experience registrations (playbook fields: first_name, email,
-- experience_date, created_at, registration_id, status).
CREATE TABLE IF NOT EXISTS experience_registrations (
  registration_id TEXT PRIMARY KEY,
  first_name      TEXT NOT NULL,
  email           TEXT NOT NULL,            -- normalized: trimmed + lowercased
  experience_date TEXT NOT NULL CHECK (experience_date IN ('2026-11-17', '2026-11-21')),
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'switched')),
  source          TEXT NOT NULL DEFAULT 'community',
  ip_hash         TEXT,
  created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
-- Dedup key: one active registration per email per date.
CREATE UNIQUE INDEX IF NOT EXISTS idx_exp_active_unique
  ON experience_registrations (email, experience_date) WHERE status = 'active';
