# backend/api/test/test_gemini_blog_view.py
import json

import pytest
from api.views.gemini_blog_view import BlogExpansionAPIView
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APIRequestFactory, force_authenticate

pytestmark = pytest.mark.django_db
User = get_user_model()


@pytest.fixture()
def factory():
    return APIRequestFactory()


@pytest.fixture()
def user():
    return User.objects.create_user(username="writer", email="w@ex.com", password="x")


def _post(factory, user=None, data=None):
    req = factory.post("/", data=json.dumps(data or {}), content_type="application/json")
    if user:
        force_authenticate(req, user=user)
    return BlogExpansionAPIView.as_view()(req)


def test_requires_auth(factory):
    resp = _post(factory, user=None, data={"wordcount": 200, "prompt_suggestion": "AI in 2025"})
    assert resp.status_code in (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN)


def test_bad_request_missing_fields(factory, user):
    resp = _post(factory, user=user, data={"wordcount": 200})
    assert resp.status_code == status.HTTP_400_BAD_REQUEST

def test_bad_request_invalid_wordcount(factory, user):
    resp = _post(factory, user=user, data={"wordcount": "abc", "prompt_suggestion": "topic"})
    assert resp.status_code == status.HTTP_400_BAD_REQUEST


def test_success_returns_blog_text(factory, user, monkeypatch):
    def fake_generate(prompt, wc):
        assert prompt == "AI safety"
        assert wc == 150
        return "Generated blog content..."
    monkeypatch.setattr("api.views.gemini_blog_view.generate_blog_text", fake_generate)

    payload = {"wordcount": 150, "prompt_suggestion": "AI safety"}
    resp = _post(factory, user=user, data=payload)
    assert resp.status_code == status.HTTP_200_OK
    assert "blog_text" in resp.data
    assert resp.data["blog_text"].startswith("Generated blog content")


def test_llm_raises_returns_500(factory, user, monkeypatch):
    def boom(*args, **kwargs):
        raise RuntimeError("model backend down")
    monkeypatch.setattr("api.views.gemini_blog_view.generate_blog_text", boom)

    payload = {"wordcount": 120, "prompt_suggestion": "Resilience"}
    resp = _post(factory, user=user, data=payload)
    assert resp.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
    assert "error" in resp.data
