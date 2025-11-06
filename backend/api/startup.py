import os

from django.contrib.auth import get_user_model
from django.db.utils import OperationalError, ProgrammingError


def ensure_default_admin():
    User = get_user_model()
    username = os.getenv("DJANGO_DEFAULT_ADMIN_USERNAME", "admin")
    email = os.getenv("DJANGO_DEFAULT_ADMIN_EMAIL", "admin@example.com")
    password = os.getenv("DJANGO_DEFAULT_ADMIN_PASSWORD", "admin123")

    try:
        admin = User.objects.filter(is_superuser=True).first()
        if not admin:
            admin = User.objects.create_superuser(username=username, email=email, password=password)
            print(f"[boot] Created default admin: {username}")

        if hasattr(admin, "is_admin_user") and not getattr(admin, "is_admin_user", False):
            admin.is_admin_user = True
            admin.save(update_fields=["is_admin_user"])
            print("[boot] Elevated superuser: set is_admin_user=True")
    except (OperationalError, ProgrammingError):
        pass
