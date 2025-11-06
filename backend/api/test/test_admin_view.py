# backend/api/test/test_admin_view.py
import json

import pytest
from api.views.admin import AdminUserManagementView
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APIRequestFactory, force_authenticate

pytestmark = pytest.mark.django_db
User = get_user_model()


@pytest.fixture()
def factory():
    return APIRequestFactory()


@pytest.fixture()
def admin_user():
    return User.objects.create_user(
        username="admin_tester", email="a@a.com", password="x",
        is_staff=True, is_superuser=False,
        is_admin_user=True,
    )


@pytest.fixture()
def normal_user():
    return User.objects.create_user(
        username="normal_tester", email="n@n.com", password="x",
        is_admin_user=False,
    )


def _call_view(method: str, factory, user, data=None, url="/", **url_kwargs):
    if "kwargs" in url_kwargs and isinstance(url_kwargs["kwargs"], dict):
        url_kwargs = url_kwargs["kwargs"]

    view = AdminUserManagementView.as_view()
    if method == "get":
        request = factory.get(url)
    elif method == "put":
        request = factory.put(url, data=json.dumps(data or {}), content_type="application/json")
    elif method == "delete":
        request = factory.delete(url)
    else:
        raise AssertionError("Unsupported method")

    force_authenticate(request, user=user)
    return view(request, **url_kwargs)





def test_permission_denied_for_non_admin(factory, normal_user):
    resp = _call_view("get", factory, normal_user)
    assert resp.status_code == status.HTTP_403_FORBIDDEN



def test_get_returns_user_list(factory, admin_user, normal_user):
    User.objects.create_user(username="u2", email="u2@ex.com", password="x", is_admin_user=False)
    resp = _call_view("get", factory, admin_user)
    assert resp.status_code == status.HTTP_200_OK
    assert isinstance(resp.data, list)
    assert len(resp.data) >= 2



def test_put_updates_admin_flag_bool_true(factory, admin_user):
    target = User.objects.create_user(username="to_update", email="t@ex.com", password="x", is_admin_user=False)
    resp = _call_view("put", factory, admin_user, data={"user_id": target.id, "is_admin_user": True})
    assert resp.status_code == status.HTTP_200_OK
    target.refresh_from_db()
    assert target.is_admin_user is True
    assert resp.data["id"] == target.id
    assert resp.data["is_admin_user"] is True


def test_put_updates_admin_flag_string_true(factory, admin_user):
    target = User.objects.create_user(username="to_update2", email="t2@ex.com", password="x", is_admin_user=False)
    resp = _call_view("put", factory, admin_user, data={"user_id": target.id, "is_admin_user": "true"})
    assert resp.status_code == status.HTTP_200_OK
    target.refresh_from_db()
    assert target.is_admin_user is True


def test_put_invalid_payload_returns_400(factory, admin_user):
    resp = _call_view("put", factory, admin_user, data={"user_id": 123})
    assert resp.status_code == status.HTTP_400_BAD_REQUEST


def test_put_user_not_found_returns_404(factory, admin_user):
    resp = _call_view("put", factory, admin_user, data={"user_id": 999999, "is_admin_user": False})
    assert resp.status_code == status.HTTP_404_NOT_FOUND



def test_delete_prevent_self_delete(factory, admin_user):
    resp = _call_view("delete", factory, admin_user, user_id=admin_user.id)
    assert resp.status_code == status.HTTP_400_BAD_REQUEST
    assert "Cannot delete your own account" in str(resp.data)


def test_delete_other_user_success(factory, admin_user, normal_user):
    resp = _call_view("delete", factory, admin_user, user_id=normal_user.id)
    assert resp.status_code == status.HTTP_200_OK
    assert not User.objects.filter(id=normal_user.id).exists()


def test_delete_user_not_found(factory, admin_user):
    resp = _call_view("delete", factory, admin_user, user_id=987654321)
    assert resp.status_code == status.HTTP_404_NOT_FOUND
