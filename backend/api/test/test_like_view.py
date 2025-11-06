import pytest
from rest_framework.test import APIRequestFactory, force_authenticate
from rest_framework import status

from api.views.like import LikeViewSet
from api.models.user import CustomUser
from api.models.post import Post
from api.models.like import Like

pytestmark = pytest.mark.django_db


def make_user(username="u", email=None, is_admin=False):
    email = email or f"{username}@ex.com"
    user = CustomUser.objects.create_user(username=username, email=email, password="Test1234!")
    if hasattr(user, "is_admin_user"):
        user.is_admin_user = is_admin
        user.save(update_fields=["is_admin_user"])
    return user


def make_post(author=None, title="T", content="C", slug="t-slug"):
    author = author or make_user("author")
    if Post._meta.get_field("slug").unique:
        from uuid import uuid4
        slug = f"{slug}-{uuid4().hex[:6]}"
    return Post.objects.create(author=author, title=title, content=content, slug=slug, is_published=True)


def test_list_requires_auth():
    """
    GET /likes/ should be rejected if not logged in, return 200 if logged in
    """
    factory = APIRequestFactory()

    # Not logged in: denied
    request = factory.get("/api/likes/")
    view = LikeViewSet.as_view({"get": "list"})
    response = view(request)
    assert response.status_code in (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN)

    # Login: Allowed
    user = make_user("alice")
    request = factory.get("/api/likes/")
    force_authenticate(request, user=user)
    response = view(request)
    assert response.status_code == status.HTTP_200_OK


def test_create_requires_auth_and_sets_user_ignored_payload_user():
    """
    POST /likes/:
    - Not logged in: rejected
    - Logged in: created successfully, and user must be request.user (even if the payload passes another user, it will be ignored)
    """
    factory = APIRequestFactory()
    view = LikeViewSet.as_view({"post": "create"})
    post = make_post()

    # Not logged in: denied
    req = factory.post("/api/likes/", {"post": post.id}, format="json")
    resp = view(req)
    assert resp.status_code in (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN)

    # login: created successfully; even if another user is passed, it is ignored
    me = make_user("me")
    someone_else = make_user("other")
    req = factory.post("/api/likes/", {"post": post.id, "user": someone_else.id}, format="json")
    force_authenticate(req, user=me)
    resp = view(req)
    assert resp.status_code in (status.HTTP_201_CREATED, status.HTTP_200_OK), getattr(resp, "data", resp)

    like_id = resp.data.get("id")
    like = Like.objects.get(id=like_id)
    assert like.user_id == me.id, "perform_create 应将 user 绑定为 request.user，而非 payload 里的 user"


def test_destroy_only_owner_can_delete():
    """
    DELETE /likes/{id}/:
    - Delete not in person → 403
    - Delete in person → 204
    """
    owner = make_user("owner")
    post = make_post(author=owner)
    like = Like.objects.create(user=owner, post=post)

    factory = APIRequestFactory()
    view = LikeViewSet.as_view({"delete": "destroy"})

    # Attempted deletion not by me: 403
    intruder = make_user("intruder")
    req = factory.delete(f"/api/likes/{like.id}/")
    force_authenticate(req, user=intruder)
    resp = view(req, pk=like.id)
    assert resp.status_code == status.HTTP_403_FORBIDDEN

    # I delete: 204
    req = factory.delete(f"/api/likes/{like.id}/")
    force_authenticate(req, user=owner)
    resp = view(req, pk=like.id)
    assert resp.status_code == status.HTTP_204_NO_CONTENT
    assert not Like.objects.filter(id=like.id).exists()
