import pytest
from rest_framework.test import APIRequestFactory, force_authenticate
from django.contrib.auth import get_user_model

from api.views.user import UserProfileView
from api.models.profile import Profile

pytestmark = pytest.mark.django_db

User = get_user_model()


def create_user_with_profile(**kwargs):
    """
    Some projects automatically create a Profile via a signal; if your project does not have that signal, you can use it to create a Profile manually.
    If your project does not have this signal, you can manually make sure that the Profile exists to avoid " "errors when accessing instance.profile during GET/PUT.
    """
    defaults = dict(username="alice", email="alice@example.com", password="Test1234!")
    defaults.update(kwargs)
    user = User.objects.create_user(**defaults)
    # Ensure profile exists
    Profile.objects.get_or_create(user=user)
    return user


def test_get_requires_auth():
    """Not logged in access should be 401"""
    factory = APIRequestFactory()
    request = factory.get("/api/user/profile/")
    view = UserProfileView.as_view()

    response = view(request)  # unauthorized
    assert response.status_code in (401, 403)  # DRF configurations may return 401 or 403


def test_get_profile_ok():
    """Logged In GET Return User with Nested Profile Fields"""
    user = create_user_with_profile(first_name="Alice", last_name="Wang")
    # Fill in the profile fields
    user.profile.bio = "Hello from bio"
    user.profile.linkedin = "https://linkedin.com/in/alice"
    user.profile.save()

    factory = APIRequestFactory()
    request = factory.get("/api/user/profile/")
    force_authenticate(request, user=user)
    view = UserProfileView.as_view()

    response = view(request)
    assert response.status_code == 200
    data = response.data

    # Basic fields
    assert data["username"] == "alice"
    assert data["email"] == "alice@example.com"
    assert data["first_name"] == "Alice"
    assert data["last_name"] == "Wang"

    # Nested profiles
    assert "profile" in data
    assert data["profile"]["bio"] == "Hello from bio"
    assert data["profile"]["linkedin"].startswith("https://")


def test_put_updates_user_and_nested_profile():
    """PUT update user base field + nested Profile field (validates both pieces of logic in serializer.update)"""
    user = create_user_with_profile(first_name="Old", last_name="Name")
    user.profile.bio = "old bio"
    user.profile.github = ""
    user.profile.save()

    payload = {
        "first_name": "NewFirst",
        "last_name": "NewLast",
        "address": "Sydney",
        "phone_number": "+61 234 567",
        "profile": {
            "bio": "new bio here",
            "github": "https://github.com/alice",
        }
    }

    factory = APIRequestFactory()
    request = factory.put("/api/user/profile/", payload, format="json")
    force_authenticate(request, user=user)
    view = UserProfileView.as_view()

    response = view(request)
    assert response.status_code == 200
    data = response.data

    # User fields updated
    assert data["first_name"] == "NewFirst"
    assert data["last_name"] == "NewLast"
    assert data["address"] == "Sydney"
    assert data["phone_number"].startswith("+61")

    # Nested profile fields updated
    assert data["profile"]["bio"] == "new bio here"
    assert data["profile"]["github"].startswith("https://github.com/")

    # Database also updated
    user.refresh_from_db()
    assert user.first_name == "NewFirst"
    assert user.profile.bio == "new bio here"


def test_put_read_only_fields_ignored():
    """
    The read-only fields (id/email/username/is_admin_user) are in Meta.read_only_fields;
    Attempted modifications should be ignored (no change to the original value and no error reported).
    """
    user = create_user_with_profile(username="bob", email="bob@example.com")
    original_id = user.id

    payload = {
        "id": 9999,
        "email": "hacked@example.com",
        "username": "hacker",
        "is_admin_user": True,
        "profile": {"bio": "ok"}
    }

    factory = APIRequestFactory()
    request = factory.put("/api/user/profile/", payload, format="json")
    force_authenticate(request, user=user)
    view = UserProfileView.as_view()

    response = view(request)
    assert response.status_code == 200 
    data = response.data

    # These fields should remain unchanged
    assert data["id"] == original_id
    assert data["email"] == "bob@example.com"
    assert data["username"] == "bob"
    # Serialized read-only fields will still output the original value (not changed by the payload)
    assert data["is_admin_user"] == getattr(user, "is_admin_user", False)

    # profile normal update
    assert data["profile"]["bio"] == "ok"

    # DB calibration
    user.refresh_from_db()
    assert user.id == original_id
    assert user.email == "bob@example.com"
    assert user.username == "bob"
    assert user.profile.bio == "ok"


def test_put_partial_fields_only_profile():
    """Update only some of the profile's fields (partial=True), others are not provided and do not report errors"""
    user = create_user_with_profile(first_name="Keep", last_name="Same")
    user.profile.bio = "old"
    user.profile.save()

    payload = {
        "profile": {
            "linkedin": "https://linkedin.com/in/keep"
        }
    }

    factory = APIRequestFactory()
    request = factory.put("/api/user/profile/", payload, format="json")
    force_authenticate(request, user=user)
    view = UserProfileView.as_view()

    response = view(request)
    assert response.status_code == 200
    data = response.data

    # User fields not provided remain as is
    assert data["first_name"] == "Keep"
    assert data["last_name"] == "Same"

    # Only updated profile.linkedin
    assert data["profile"]["linkedin"].startswith("https://")
