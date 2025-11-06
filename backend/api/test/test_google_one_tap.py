# backend/api/test/test_google_one_tap.py
import json

import pytest
from api.views.google_one_tap import GoogleOneTapLoginAPIView
from django.contrib.auth import get_user_model
from django.test.utils import override_settings
from rest_framework import status
from rest_framework.test import APIRequestFactory

pytestmark = pytest.mark.django_db
User = get_user_model()

GOOGLE_SETTINGS = {
    "SOCIALACCOUNT_PROVIDERS": {
        "google": {
            "APP": {"client_id": "dummy-client-id"}
        }
    }
}

@pytest.fixture()
def factory():
    return APIRequestFactory()

def _post(factory, data=None):
    req = factory.post("/", data=json.dumps(data or {}), content_type="application/json")
    return GoogleOneTapLoginAPIView.as_view()(req)

@override_settings(**GOOGLE_SETTINGS)
def test_missing_credential_returns_400(factory):
    resp = _post(factory, data={})  # 没有 credential
    assert resp.status_code == status.HTTP_400_BAD_REQUEST
    assert "Missing credential" in str(resp.data)

@override_settings(**GOOGLE_SETTINGS)
def test_invalid_token_returns_400(factory, monkeypatch):
    def fake_verify(token, request, client_id):
        raise ValueError("bad token")
    monkeypatch.setattr("api.views.google_one_tap.id_token.verify_oauth2_token", fake_verify)

    resp = _post(factory, data={"credential": "invalid"})
    assert resp.status_code == status.HTTP_400_BAD_REQUEST
    assert "Invalid token" in str(resp.data)

@override_settings(**GOOGLE_SETTINGS)
def test_no_email_in_idinfo_returns_400(factory, monkeypatch):
    def fake_verify(token, request, client_id):
        return {"given_name": "A", "family_name": "B"} 
    monkeypatch.setattr("api.views.google_one_tap.id_token.verify_oauth2_token", fake_verify)

    resp = _post(factory, data={"credential": "ok"})
    assert resp.status_code == status.HTTP_400_BAD_REQUEST
    assert "Email not available" in str(resp.data)

@override_settings(**GOOGLE_SETTINGS)
def test_success_creates_user_and_returns_tokens(factory, monkeypatch):
    def fake_verify(token, request, client_id):
        return {
            "email": "newuser@example.com",
            "given_name": "New",
            "family_name": "User",
        }
    monkeypatch.setattr("api.views.google_one_tap.id_token.verify_oauth2_token", fake_verify)

    resp = _post(factory, data={"credential": "good"})
    assert resp.status_code == status.HTTP_200_OK
    assert {"token", "refresh", "user"} <= resp.data.keys()
    assert resp.data["user"]["email"] == "newuser@example.com"
    assert User.objects.filter(email="newuser@example.com").exists()

@override_settings(**GOOGLE_SETTINGS)
def test_success_existing_user_login(factory, monkeypatch):
    User.objects.create_user(
        username="newuser", email="newuser@example.com", password="x"
    )

    def fake_verify(token, request, client_id):
        return {
            "email": "newuser@example.com",
            "given_name": "New",
            "family_name": "User",
        }
    monkeypatch.setattr("api.views.google_one_tap.id_token.verify_oauth2_token", fake_verify)

    resp = _post(factory, data={"credential": "good"})
    assert resp.status_code == status.HTTP_200_OK
    assert User.objects.filter(email="newuser@example.com").count() == 1
