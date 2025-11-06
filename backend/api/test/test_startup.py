# api/startup.py
import os

from django.contrib.auth import get_user_model
from django.db.utils import OperationalError, ProgrammingError


def ensure_default_admin():
    """
    Ensure at least one superuser exists.
    If none exists, create one using env vars or defaults.
    Swallow DB errors gracefully.
    """
    User = get_user_model()

    username = os.getenv("DJANGO_DEFAULT_ADMIN_USERNAME", "admin")
    email = os.getenv("DJANGO_DEFAULT_ADMIN_EMAIL", "admin@example.com")
    password = os.getenv("DJANGO_DEFAULT_ADMIN_PASSWORD", "admin123")

    try:
        # Check if ANY superuser exists
        if User.objects.filter(is_superuser=True).exists():
            return  # Do nothing if a superuser already exists

        # Otherwise, create the default admin
        User.objects.create_superuser(
            username=username,
            email=email,
            password=password,
        )
        print(f"[boot] Created default admin: {username}")

    except (OperationalError, ProgrammingError):
        # Swallow DB initialization errors
        pass
