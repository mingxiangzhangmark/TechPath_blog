-- === Runtime account: CRUD only, no DDL ===
CREATE ROLE app_user LOGIN PASSWORD 'app_user_run'
  NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT;

-- === Account Migration: Object Owner, Used Only During Deployment/Migration ===
CREATE ROLE app_owner LOGIN PASSWORD 'app_owner_run'
  NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT;

-- Database and schema (modify as required)
-- DB name: django_db; schema: public
REVOKE ALL ON DATABASE django_db FROM PUBLIC;
GRANT  CONNECT, TEMPORARY ON DATABASE django_db TO app_user, app_owner;

REVOKE CREATE ON SCHEMA public FROM PUBLIC;
GRANT  USAGE  ON SCHEMA public TO app_user;
ALTER  SCHEMA public OWNER TO app_owner;

-- Existing objects → Grant runtime CRUD/sequence permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES    IN SCHEMA public TO app_user;
GRANT USAGE,  SELECT               ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- Future new objects → By default, also grant the permissions required for runtime (crucial)
ALTER DEFAULT PRIVILEGES FOR ROLE app_owner IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_user;
ALTER DEFAULT PRIVILEGES FOR ROLE app_owner IN SCHEMA public
  GRANT USAGE,  SELECT               ON SEQUENCES TO app_user;

-- (Optional) Fix the search_path to prevent accidental use of other schemas.
ALTER ROLE app_user  SET search_path TO public;
ALTER ROLE app_owner SET search_path TO public;
