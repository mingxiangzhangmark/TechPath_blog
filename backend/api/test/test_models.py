import pytest
from django.utils.text import slugify
from api.models import (
    CustomUser, Profile, Post, Tag, Comment, Like,
    SecurityQuestion, UserSecurityAnswer
)

# ======================================================
# ? CustomUser & Profile
# ======================================================

@pytest.mark.django_db
def test_user_profile_creation_signal():
    """A Profile should be automatically created when a CustomUser is created."""
    user = CustomUser.objects.create_user(username="alice", email="alice@example.com", password="pass123")
    profile = Profile.objects.get(user=user)
    assert profile is not None
    assert str(profile) == f"Profile({user.username})"
    assert profile.user.username == "alice"


@pytest.mark.django_db
def test_user_str_method():
    """__str__ of CustomUser returns username"""
    user = CustomUser.objects.create_user(username="bob", email="bob@example.com", password="pass")
    assert str(user) == "bob"


# ======================================================
# ? Tag
# ======================================================

@pytest.mark.django_db
def test_tag_slug_auto_generation():
    """Tag should auto-generate a slug based on its name"""
    tag = Tag.objects.create(name="Django Testing")
    assert tag.slug == slugify("Django Testing")
    assert str(tag) == "Django Testing"

@pytest.mark.django_db
def test_tag_slug_unique_increment():
    """Slug should auto-increment when duplicate slug base exists"""
    tag1 = Tag.objects.create(name="python")
    tag2 = Tag.objects.create(name="python framework")
    assert tag1.slug == "python"
    assert tag2.slug.startswith("python-")


# ======================================================
# ? Post
# ======================================================

@pytest.mark.django_db
def test_post_slug_auto_generation():
    """Post auto-generates unique slug and string representation"""
    user = CustomUser.objects.create_user(username="writer", email="w@example.com", password="pw")
    post = Post.objects.create(author=user, title="My First Post", content="Test content")
    assert post.slug == "my-first-post"
    assert str(post) == "My First Post"

@pytest.mark.django_db
def test_post_duplicate_slug_increment():
    """Ensure duplicate slugs increment correctly"""
    user = CustomUser.objects.create_user(username="writer2", email="w2@example.com", password="pw")
    p1 = Post.objects.create(author=user, title="Same Title", content="A")
    p2 = Post.objects.create(author=user, title="Same Title", content="B")
    assert p1.slug == "same-title"
    assert p2.slug.startswith("same-title-")


# ======================================================
# ? Comment & Like
# ======================================================

@pytest.mark.django_db
def test_comment_creation_and_str():
    """Comment string includes author and post title"""
    user = CustomUser.objects.create_user(username="charlie", email="c@example.com", password="pw")
    post = Post.objects.create(author=user, title="Post Title", content="Hello")
    comment = Comment.objects.create(post=post, author=user, content="Nice post!")
    assert str(comment) == f"{user.username} on {post.title[:30]}"
    assert comment.post == post
    assert comment.author == user

@pytest.mark.django_db
def test_like_unique_together_constraint():
    """User cannot like the same post twice (unique_together)"""
    user = CustomUser.objects.create_user(username="david", email="d@example.com", password="pw")
    post = Post.objects.create(author=user, title="Like Test", content="Good content")
    Like.objects.create(user=user, post=post)
    with pytest.raises(Exception):
        Like.objects.create(user=user, post=post)


# ======================================================
# ? SecurityQuestion & UserSecurityAnswer
# ======================================================

@pytest.mark.django_db
def test_security_question_and_answer_str():
    """SecurityQuestion and UserSecurityAnswer string representation"""
    user = CustomUser.objects.create_user(username="eve", email="eve@example.com", password="pw")
    q = SecurityQuestion.objects.create(question_text="What is your pet name?")
    a = UserSecurityAnswer.objects.create(user=user, question=q, answer="Fluffy")
    assert str(q) == "What is your pet name?"
    assert str(a) == f"{user.username} - {q.question_text}"

@pytest.mark.django_db
def test_user_security_answer_unique_constraint():
    """Ensure a user cannot answer the same question twice"""
    user = CustomUser.objects.create_user(username="a", email="a@example.com", password="x")
    q = SecurityQuestion.objects.create(question_text="Favorite color?")
    UserSecurityAnswer.objects.create(user=user, question=q, answer="Red")

    with pytest.raises(Exception):
        UserSecurityAnswer.objects.create(user=user, question=q, answer="Blue")