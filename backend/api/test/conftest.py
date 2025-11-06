import pytest

@pytest.fixture(scope='session')
def django_db_setup():
    from django.conf import settings
    settings.DATABASES['default'] = {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }

@pytest.fixture(autouse=True)
def _ensure_atomic_requests(settings):
    for alias, cfg in settings.DATABASES.items():
        cfg.setdefault("ATOMIC_REQUESTS", False)