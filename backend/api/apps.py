from django.apps import AppConfig
from django.db.models.signals import post_migrate


class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'

    def ready(self):
        from . import signals  # noqa
        from api.startup import ensure_default_admin

        ensure_default_admin()

        def _ensure_admin_signal(**kwargs):
            ensure_default_admin()
        post_migrate.connect(_ensure_admin_signal, sender=self, weak=False)
