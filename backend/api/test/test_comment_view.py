# backend/api/test/test_comment_view.py
import json

import pytest
from api.models.comment import Comment
from api.models.post import Post
from api.views.comment import CommentViewSet
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIRequestFactory, force_authenticate

pytestmark = pytest.mark.django_db
User = get_user_model()

def _items(resp):
    """Unify list data whether pagination is on or off."""
    return resp.data if isinstance(resp.data, list) else resp.data.get("results", [])


@pytest.fixture()
def factory():
    return APIRequestFactory()


@pytest.fixture()
def user():
    return User.objects.create_user(username="u1", email="u1@ex.com", password="x")


@pytest.fixture()
def admin_user():
    return User.objects.create_user(
        username="admin1", email="a@ex.com", password="x", is_admin_user=True
    )


@pytest.fixture()
def other_user():
    return User.objects.create_user(username="u2", email="u2@ex.com", password="x")


@pytest.fixture()
def post(user):
    return Post.objects.create(title="p1", content="...", author=user, created_at=timezone.now())


def _view(mapping):
    return CommentViewSet.as_view(mapping)


def test_list_allows_anonymous(factory, post, user):
    Comment.objects.create(post=post, author=user, content="c1")
    req = factory.get("/comments/")
    resp = _view({"get": "list"})(req)
    assert resp.status_code == status.HTTP_200_OK
    items = _items(resp)
    assert isinstance(items, list)
    assert len(items) >= 1



def test_filter_by_author_and_post(factory, post, user, other_user):
    c1 = Comment.objects.create(post=post, author=user, content="mine")
    Comment.objects.create(post=post, author=other_user, content="other")
    req = factory.get(f"/comments/?author={user.id}&post={post.id}")
    resp = _view({"get": "list"})(req)
    assert resp.status_code == status.HTTP_200_OK
    items = _items(resp)
    ids = {item["id"] for item in items}
    assert len(items) == 1
    assert c1.id in ids


def test_create_requires_auth(factory, post):
    payload = {"post": post.id, "content": "hello"}
    req = factory.post("/comments/", data=json.dumps(payload), content_type="application/json")
    resp = _view({"post": "create"})(req)
    assert resp.status_code in (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN)


def test_create_sets_author_to_request_user(factory, post, user):
    payload = {"post": post.id, "content": "hello"}
    req = factory.post("/comments/", data=json.dumps(payload), content_type="application/json")
    force_authenticate(req, user=user)
    resp = _view({"post": "create"})(req)
    assert resp.status_code == status.HTTP_201_CREATED
    created = Comment.objects.get(id=resp.data["id"])
    assert created.author_id == user.id
    assert created.post_id == post.id


def test_update_denied_for_non_author_non_admin(factory, post, user, other_user):
    c = Comment.objects.create(post=post, author=user, content="orig")
    payload = {"content": "hack"}
    req = factory.put(f"/comments/{c.id}/", data=json.dumps(payload), content_type="application/json")
    force_authenticate(req, user=other_user)
    resp = _view({"put": "update"})(req, pk=c.id)
    assert resp.status_code in (status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND)


def test_update_allowed_for_author(factory, post, user):
    c = Comment.objects.create(post=post, author=user, content="orig")
    payload = {"content": "edited"}
    req = factory.patch(f"/comments/{c.id}/", data=json.dumps(payload), content_type="application/json")
    force_authenticate(req, user=user)  
    resp = _view({"patch": "partial_update"})(req, pk=c.id)
    assert resp.status_code == status.HTTP_200_OK
    c.refresh_from_db()
    assert c.content == "edited"


def test_destroy_allowed_for_admin(factory, post, user, admin_user):
    c = Comment.objects.create(post=post, author=user, content="to delete")
    req = factory.delete(f"/comments/{c.id}/")
    force_authenticate(req, user=admin_user)
    resp = _view({"delete": "destroy"})(req, pk=c.id)
    assert resp.status_code == status.HTTP_204_NO_CONTENT
    assert not Comment.objects.filter(id=c.id).exists()


def test_mine_requires_auth(factory, user):
    req = factory.get("/comments/mine/")
    force_authenticate(req, user=user)
    resp = _view({"get": "mine"})(req)
    assert resp.status_code == status.HTTP_200_OK

def test_mine_returns_only_self_with_limit(factory, post, user):
    for i in range(3):
        Comment.objects.create(post=post, author=user, content=f"mine {i}")
    other = User.objects.create_user(username="o", email="o@ex.com", password="x")
    for i in range(2):
        Comment.objects.create(post=post, author=other, content=f"other {i}")

    req = factory.get("/comments/mine/?limit=2")
    force_authenticate(req, user=user)
    resp = _view({"get": "mine"})(req)
    assert resp.status_code == status.HTTP_200_OK
    assert len(resp.data) == 2
    assert all("mine" in item["content"] for item in resp.data)


def test_mine_limit_invalid_defaults_to_50(factory, post, user):
    for i in range(5):
        Comment.objects.create(post=post, author=user, content=f"mine {i}")
    req = factory.get("/comments/mine/?limit=abc")
    force_authenticate(req, user=user)
    resp = _view({"get": "mine"})(req)
    assert resp.status_code == status.HTTP_200_OK
    assert len(resp.data) == 5
