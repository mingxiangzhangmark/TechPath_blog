## Deployment DB Permissions – Runbook

**Goal**

* Use two roles in PostgreSQL:

  * `app_owner`: owns schema/objects, used **only** to run migrations;
  * `app_user`: runtime **least-privilege** user (CRUD on tables, USAGE/SELECT on sequences), **no DDL**.
* App reads DB creds from environment variables; no code changes needed across stages.

**One-time DB bootstrap (on production DB)**
Run the SQL script from the project root:

```bash
psql "host=<prod-host> dbname=django_db user=<admin>" -f db/bootstrap_roles.sql
```

Replace the placeholder passwords inside the script before executing (or run interactively and set them afterward).

**CI/CD (two sets of env)**

* **Migrate step (DDL)** – Use the settings under #deploy in .env.example

* **Run application (CRUD)** – Use the settings under #run in .env.example

**Verification (screenshots for audit)**
Connect with `psql` and capture outputs:

```
\du+ app_owner app_user      -- NOSUPERUSER / NOCREATEDB / NOCREATEROLE / NOINHERIT
\dn+ public                  -- app_user has USAGE only (no CREATE)
\dp public.*                 -- tables: arwd; sequences: USAGE, SELECT
```

Optionally:

```sql
SELECT grantee, privilege_type, table_name
FROM information_schema.table_privileges
WHERE table_schema='public' AND grantee='app_user'
ORDER BY table_name, privilege_type;
```