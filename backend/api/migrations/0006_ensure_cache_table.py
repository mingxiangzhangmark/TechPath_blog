from django.db import migrations

def create_cache_table(apps, schema_editor):
    """
    Automatically creates a cached table when DatabaseCache is used and the table does not exist.
    """
    from django.conf import settings
    from django.core.management import call_command

    # Read CACHES.default configuration
    try:
        cache_cfg = settings.CACHES["default"]
    except Exception:
        return

    # Handled only at DatabaseCache
    if cache_cfg.get("BACKEND") != "django.core.cache.backends.db.DatabaseCache":
        return

    table = cache_cfg.get("LOCATION")
    if not isinstance(table, str) or not table:
        return

    # Idempotency check: skip if table already exists
    connection = schema_editor.connection
    existing = set(connection.introspection.table_names())
    if table in existing:
        return

    # Support for multiple databases: use the connection alias of the current migration
    alias = connection.alias
    try:
        call_command("createcachetable", table, database=alias, verbosity=0)
    except Exception:
        # Concurrency/permissions exceptions are silently skipped to avoid disrupting the migration
        pass

class Migration(migrations.Migration):
    dependencies = [
        ("api", "0005_securityquestion_usersecurityanswer"),
    ]
    operations = [
        migrations.RunPython(create_cache_table, migrations.RunPython.noop),
    ]
