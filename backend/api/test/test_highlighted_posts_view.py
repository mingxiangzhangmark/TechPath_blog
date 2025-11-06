# backend/api/test/test_highlighted_posts_view.py
import pytest
from api.models.like import Like
from api.models.post import Post
from api.views.highlighted_posts import HighlightedPostsView
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIRequestFactory

pytestmark = pytest.mark.django_db
User = get_user_model()


@pytest.fixture()
def factory():
    return APIRequestFactory()


@pytest.fixture()
def users():
    return [
        User.objects.create_user(username=f"u{i}", email=f"u{i}@ex.com", password="x")
        for i in range(1, 6)
    ]


def _mk_post(idx: int, published=True, minutes_ago=0, author=None):
    if author is None:
        author = User.objects.create_user(
            username=f"author_{idx}", email=f"a{idx}@ex.com", password="x"
        )
    post = Post.objects.create(
        author=author,
        title=f"p{idx}",
        content="...",
        is_published=published,
    )
    if minutes_ago is not None:
        Post.objects.filter(pk=post.pk).update(
            created_at=timezone.now() - timezone.timedelta(minutes=minutes_ago)
        )
        post.refresh_from_db()
    return post



def _like(post, user):
    Like.objects.create(post=post, user=user)


def test_highlighted_allows_anonymous_and_has_keys(factory):
    req = factory.get("/highlighted/")
    resp = HighlightedPostsView.as_view()(req)
    assert resp.status_code == status.HTTP_200_OK
    assert "latest" in resp.data and "most_liked" in resp.data
    assert isinstance(resp.data["latest"], list)
    assert isinstance(resp.data["most_liked"], list)


def test_latest_returns_top6_by_created_desc(factory):
    posts = []
    for i in range(1, 9):
        posts.append(_mk_post(i, published=True, minutes_ago=(9 - i)))  

    req = factory.get("/highlighted/")
    resp = HighlightedPostsView.as_view()(req)
    assert resp.status_code == status.HTTP_200_OK

    latest = resp.data["latest"]
    assert len(latest) == 6
    latest_titles = [item["title"] for item in latest]
    assert latest_titles == ["p8", "p7", "p6", "p5", "p4", "p3"]


def test_most_liked_sorted_and_only_published(factory, users):
    _mk_post(0, published=False)
    _mk_post(-1, published=False)

    pA = _mk_post( "A", published=True, minutes_ago=0)
    pB = _mk_post( "B", published=True, minutes_ago=1)
    pC = _mk_post( "C", published=True, minutes_ago=2)
    pD = _mk_post( "D", published=True, minutes_ago=3)
    pE = _mk_post( "E", published=True, minutes_ago=4)

    for u in users[:3]:
        _like(pA, u)
    for u in users[:4]:
        _like(pC, u)
    for u in users[:3]:
        _like(pD, u)
    _like(pB, users[0])

    req = factory.get("/highlighted/")
    resp = HighlightedPostsView.as_view()(req)
    assert resp.status_code == status.HTTP_200_OK

    liked = resp.data["most_liked"]
    titles = [item["title"] for item in liked]

    assert titles[:5] == ["pC", "pA", "pD", "pB", "pE"]

    assert "p0" not in titles and "p-1" not in titles
