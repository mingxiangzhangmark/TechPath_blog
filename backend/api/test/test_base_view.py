# backend/api/test/test_base_view.py
import pytest
from api.views.base import HelloWorldView
from rest_framework import status
from rest_framework.test import APIRequestFactory

pytestmark = pytest.mark.django_db

def test_hello_world_returns_200_and_message():
    factory = APIRequestFactory()
    req = factory.get("/")
    resp = HelloWorldView.as_view()(req)
    assert resp.status_code == status.HTTP_200_OK
    assert isinstance(resp.data, dict)
    assert resp.data.get("message") == "Hello from API!"
