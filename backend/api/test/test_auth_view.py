# backend/api/test/test_auth_view.py
import json

import pytest
from api.views.auth import (AdminUserManagementView, LogoutView,
                            MyTokenObtainPairView, SignupView)
from django.contrib.auth import get_user_model
from django.test.utils import override_settings
from rest_framework import status
from rest_framework.test import APIRequestFactory, force_authenticate
from rest_framework_simplejwt.tokens import RefreshToken

pytestmark = pytest.mark.django_db
User = get_user_model()

LOC_MEM_CACHE = {
    "default": {"BACKEND": "django.core.cache.backends.locmem.LocMemCache"}
}


@pytest.fixture()
def factory():
    return APIRequestFactory()



@override_settings(CACHES=LOC_MEM_CACHE)
def test_signup_success(factory):
    payload = {"username": "alice", "email": "alice@ex.com", "password": "x1234567", "security_answers": ["ans1", "ans2", "ans3"]}
    req = factory.post("/", data=json.dumps(payload), content_type="application/json")
    resp = SignupView.as_view()(req)
    assert resp.status_code == status.HTTP_201_CREATED
    assert User.objects.filter(username="alice").exists()


@override_settings(CACHES=LOC_MEM_CACHE)
def test_signup_bad_request(factory):
    payload = {"username": "bob"}
    req = factory.post("/", data=json.dumps(payload), content_type="application/json")
    resp = SignupView.as_view()(req)
    assert resp.status_code == status.HTTP_400_BAD_REQUEST



@pytest.fixture()
def user_for_login():
    return User.objects.create_user(
        username="charlie", email="c@ex.com", password="pass12345", is_admin_user=False
    )


@override_settings(CACHES=LOC_MEM_CACHE)
def test_login_by_username(factory, user_for_login):
    payload = {"username": "charlie", "password": "pass12345"}
    req = factory.post("/", data=json.dumps(payload), content_type="application/json")
    resp = MyTokenObtainPairView.as_view()(req)
    assert resp.status_code == status.HTTP_200_OK
    for key in ("access", "refresh", "username", "email", "is_admin_user"):
        assert key in resp.data


@override_settings(CACHES=LOC_MEM_CACHE)
def test_login_by_email(factory, user_for_login):
    payload = {"username": "c@ex.com", "password": "pass12345"}
    req = factory.post("/", data=json.dumps(payload), content_type="application/json")
    resp = MyTokenObtainPairView.as_view()(req)
    assert resp.status_code == status.HTTP_200_OK
    assert resp.data["username"] == "charlie"


@override_settings(CACHES=LOC_MEM_CACHE)
def test_login_bad_credentials(factory):
    payload = {"username": "nobody", "password": "wrong"}
    req = factory.post("/", data=json.dumps(payload), content_type="application/json")
    resp = MyTokenObtainPairView.as_view()(req)
    assert resp.status_code in (status.HTTP_401_UNAUTHORIZED, status.HTTP_400_BAD_REQUEST)



@override_settings(CACHES=LOC_MEM_CACHE)
def test_logout_success(factory, user_for_login):
    refresh = RefreshToken.for_user(user_for_login)
    access = str(refresh.access_token)

    payload = {"refresh": str(refresh), "access": access}
    req = factory.post("/", data=json.dumps(payload), content_type="application/json")
    resp = LogoutView.as_view()(req)
    assert resp.status_code == status.HTTP_205_RESET_CONTENT


@override_settings(CACHES=LOC_MEM_CACHE)
def test_logout_missing_refresh_returns_400(factory):
    req = factory.post("/", data=json.dumps({}), content_type="application/json")
    resp = LogoutView.as_view()(req)
    assert resp.status_code == status.HTTP_400_BAD_REQUEST

@override_settings(CACHES=LOC_MEM_CACHE)
def test_logout_invalid_access_returns_400(factory, user_for_login):
    refresh = RefreshToken.for_user(user_for_login)
    payload = {
        "refresh": str(refresh),
        "access": "not-a-jwt-token"  
    }
    req = factory.post("/", data=json.dumps(payload), content_type="application/json")
    resp = LogoutView.as_view()(req)
    assert resp.status_code == status.HTTP_400_BAD_REQUEST
    assert "error" in resp.data


def test_admin_delete_self_returns_400(factory):
    admin = User.objects.create_user(
        username="admin_1", email="a@ex.com", password="x", is_admin_user=True
    )
    req = factory.delete("/", content_type="application/json")
    force_authenticate(req, user=admin)

    resp = AdminUserManagementView.as_view()(req, user_id=str(admin.id))

    assert resp.status_code == status.HTTP_400_BAD_REQUEST
    assert "Cannot delete your own account" in resp.data.get("error", "")

def test_admin_delete_nonexistent_returns_404(factory):
    admin, _ = User.objects.get_or_create(
        username="admin_del404",
        defaults={"email": "a2@ex.com", "is_admin_user": True}
    )
    admin.set_password("x"); admin.save()

    req = factory.delete("/", content_type="application/json")
    force_authenticate(req, user=admin)
    resp = AdminUserManagementView.as_view()(req, user_id="99999999")

    assert resp.status_code == status.HTTP_404_NOT_FOUND
    assert "not found" in resp.data.get("error", "").lower()

