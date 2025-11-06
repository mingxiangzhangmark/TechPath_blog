import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from django.utils import timezone
from uuid import uuid4

from api.models import CustomUser, Post, Tag

pytestmark = pytest.mark.django_db


def make_user(username, is_admin=False):
    user = CustomUser.objects.create_user(
        username=username, email=f"{username}@ex.com", password="p@ssw0rd"
    )
    if hasattr(user, "is_admin_user"):
        user.is_admin_user = is_admin
        user.save(update_fields=["is_admin_user"])
    else:
        user.is_staff = is_admin
        user.save(update_fields=["is_staff"])
    return user


def attach_tag(post, name="python"):
    tag, _ = Tag.objects.get_or_create(name=name)
    post.tags.add(tag)
    return tag


def _results(data):
    """Compatible with with/without pagination: return to list data ontology."""
    if isinstance(data, list):
        return data
    if isinstance(data, dict) and "results" in data:
        return data["results"]
    return data  


def test_list_search_and_ordering():
    # Make sure each slug is unique
    slug1 = f"learn-python-{uuid4().hex[:6]}"
    slug2 = f"advanced-django-{uuid4().hex[:6]}"

    _ = Post.objects.create(
        author=make_user("u1"),
        title="Learn Python",
        content="Intro content",
        slug=slug1,
        is_published=True,
        created_at=timezone.now(),
        updated_at=timezone.now(),
    )
    _ = Post.objects.create(
        author=make_user("u2"),
        title="Advanced Django",
        content="Django deep dive",
        slug=slug2,
        is_published=True,
        created_at=timezone.now() + timezone.timedelta(days=1),
        updated_at=timezone.now() + timezone.timedelta(days=1),
    )

    client = APIClient()

    # Basic list
    r = client.get(reverse("post-list"))
    assert r.status_code == 200
    items = _results(r.data)
    assert isinstance(items, list) and len(items) >= 2

    # Search: title hit
    r = client.get(reverse("post-list"), {"search": "django"})
    assert r.status_code == 200
    items = _results(r.data)
    titles = [str(x.get("title", "")).lower() for x in items]
    assert any("django" in t for t in titles)

    # Sort by: created_at in reverse order (newest first)
    r = client.get(reverse("post-list"), {"ordering": "-created_at"})
    assert r.status_code == 200
    items = _results(r.data)
    assert items, "empty results"
    first_slug = items[0].get("slug")
    assert first_slug in {slug2, "advanced-django"}  # Whether to return the original slug text in compatible serialization.


def test_filter_by_tags_query_param():
    slug_a = f"t1-{uuid4().hex[:6]}"
    slug_b = f"t2-{uuid4().hex[:6]}"

    p1 = Post.objects.create(author=make_user("u3"), title="T1", content="C1", slug=slug_a, is_published=True)
    _p2 = Post.objects.create(author=make_user("u4"), title="T2", content="C2", slug=slug_b, is_published=True)
    attach_tag(p1, "python")

    client = APIClient()
    r = client.get(reverse("post-list"), {"tags": "python"})
    assert r.status_code == 200
    items = _results(r.data)
    slugs = [x.get("slug") for x in items]
    assert slug_a in slugs
    assert slug_b not in slugs


def test_retrieve_by_slug():
    slug = f"java-1-{uuid4().hex[:6]}"
    Post.objects.create(author=make_user("u5"), title="Java", content="x", slug=slug, is_published=True)
    client = APIClient()
    r = client.get(reverse("post-detail", kwargs={"slug": slug}))
    assert r.status_code == 200
    assert r.data.get("slug") == slug


def test_create_requires_auth_and_sets_author():
    user = make_user("author1")
    client = APIClient()

    # Not logged in: denied
    r = client.post(
        reverse("post-list"),
        {"title": "T", "content": "C", "tags": ["java"]},
        format="json",
    )
    assert r.status_code in (401, 403)

    Tag.objects.get_or_create(name="java")

    # After login: successfully created and author=current user
    client.force_authenticate(user=user)
    r = client.post(
        reverse("post-list"),
        {
            "title": f"My Post {uuid4().hex[:6]}",
            "content": "Body",
            "tags": ["java"], 
        },
        format="json",
    )
    assert r.status_code in (200, 201), getattr(r, "data", r.content)

    created = Post.objects.order_by("-id").first()
    assert created.author_id == user.id


def test_update_only_author_or_admin():
    author = make_user("author2")
    other = make_user("other2")
    admin = make_user("admin2", is_admin=True)
    slug = f"edit-me-{uuid4().hex[:6]}"

    post = Post.objects.create(author=author, title="Old", content="X", slug=slug, is_published=True)

    client = APIClient()

    # Non-authors: prohibited
    client.force_authenticate(user=other)
    r = client.patch(
        reverse("post-detail", kwargs={"slug": slug}),
        {"title": "Hacked"},
        format="json",
    )
    assert r.status_code in (403, 404)

    # By permission
    client.force_authenticate(user=author)
    r = client.patch(
        reverse("post-detail", kwargs={"slug": slug}),
        {"title": "By Author"},
        format="json",
    )
    assert r.status_code in (200, 202)
    assert r.data.get("title") == "By Author"

    # Administrator: Permission granted
    client.force_authenticate(user=admin)
    r = client.patch(
        reverse("post-detail", kwargs={"slug": slug}),
        {"content": "Admin changed"},
        format="json",
    )
    assert r.status_code in (200, 202)
    assert r.data.get("content") == "Admin changed"


def test_delete_only_author_or_admin():
    author = make_user("author3")
    other = make_user("other3")
    admin = make_user("admin3", is_admin=True)
    slug1 = f"delete-me-{uuid4().hex[:6]}"
    slug2 = f"delete-me-2-{uuid4().hex[:6]}"

    Post.objects.create(author=author, title="To be deleted", content="C", slug=slug1, is_published=True)
    Post.objects.create(author=author, title="To be deleted 2", content="C2", slug=slug2, is_published=True)

    client = APIClient()

    # Can't delete without logging in #
    r = client.delete(reverse("post-detail", kwargs={"slug": slug1}))
    assert r.status_code in (401, 403)

    # Can't be deleted by non-authors
    client.force_authenticate(user=other)
    r = client.delete(reverse("post-detail", kwargs={"slug": slug1}))
    assert r.status_code in (403, 404)

    # The author can delete
    client.force_authenticate(user=author)
    r = client.delete(reverse("post-detail", kwargs={"slug": slug1}))
    assert r.status_code == 204

    # The administrator can delete
    client.force_authenticate(user=admin)
    r = client.delete(reverse("post-detail", kwargs={"slug": slug2}))
    assert r.status_code == 204
