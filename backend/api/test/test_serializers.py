import pytest
from rest_framework.exceptions import ValidationError
from rest_framework.test import APIRequestFactory
from api.models import (
    CustomUser, Profile, Post, Tag, Like, Comment,
    SecurityQuestion, UserSecurityAnswer
)
from api.serializers import (
    SignupSerializer, TagSerializer, PostSerializer,
    CommentSerializer, LikeSerializer,
    UserProfileSerializer, BlogExpansionRequestSerializer,
)
from api.serializers.security_serializers import (
    SecurityQuestionSerializer, VerifySecurityAnswersSerializer
)


# ======================================================
# ? SignupSerializer
# ======================================================

@pytest.mark.django_db
def test_signup_serializer_creates_user_and_answers():
    """SignupSerializer should create user and store 3 security answers"""
    for text in ["Q1", "Q2", "Q3"]:
        SecurityQuestion.objects.create(question_text=text)

    serializer = SignupSerializer(data={
        "username": "tester",
        "email": "t@example.com",
        "password": "Test1234",
        "first_name": "T",
        "last_name": "User",
        "address": "Sydney",
        "phone_number": "+6123456789",
        "security_answers": ["A1", "A2", "A3"],
    })
    assert serializer.is_valid(), serializer.errors
    user = serializer.save()
    assert CustomUser.objects.filter(username="tester").exists()
    assert UserSecurityAnswer.objects.filter(user=user).count() == 3


@pytest.mark.django_db
def test_signup_serializer_duplicate_email():
    """Should reject duplicate email"""
    CustomUser.objects.create_user(username="u1", email="dup@example.com", password="x")
    for text in ["Q1", "Q2", "Q3"]:
        SecurityQuestion.objects.create(question_text=text)
    serializer = SignupSerializer(data={
        "username": "u2",
        "email": "dup@example.com",
        "password": "Strong123",
        "security_answers": ["A", "B", "C"],
    })
    assert not serializer.is_valid()
    assert "email" in serializer.errors


@pytest.mark.django_db
def test_signup_serializer_invalid_phone():
    """Should reject invalid phone number format"""
    for text in ["Q1", "Q2", "Q3"]:
        SecurityQuestion.objects.create(question_text=text)
    serializer = SignupSerializer(data={
        "username": "u3",
        "email": "p@example.com",
        "password": "Pass1234",
        "phone_number": "abc",
        "security_answers": ["A", "B", "C"],
    })
    assert not serializer.is_valid()
    assert "phone_number" in serializer.errors


# ======================================================
# ? SecurityQuestionSerializer & VerifySecurityAnswersSerializer
# ======================================================

@pytest.mark.django_db
def test_security_question_serializer_output():
    q = SecurityQuestion.objects.create(question_text="What is your name?")
    s = SecurityQuestionSerializer(q)
    assert s.data["question_text"] == "What is your name?"


@pytest.mark.django_db
def test_verify_security_answers_valid_flow():
    """User resets password successfully with correct answers"""
    q1 = SecurityQuestion.objects.create(question_text="Q1")
    q2 = SecurityQuestion.objects.create(question_text="Q2")
    q3 = SecurityQuestion.objects.create(question_text="Q3")
    user = CustomUser.objects.create_user(username="alice", email="a@example.com", password="OldPass123")
    for q, a in zip([q1, q2, q3], ["A1", "A2", "A3"]):
        UserSecurityAnswer.objects.create(user=user, question=q, answer=a)
    data = {
        "email": "a@example.com",
        "answers": ["A1", "A2", "A3"],
        "new_password": "NewPass123"
    }
    s = VerifySecurityAnswersSerializer(data=data)
    assert s.is_valid(), s.errors
    validated = s.validated_data
    assert validated["email"] == "a@example.com"
    user.refresh_from_db()
    assert user.check_password("NewPass123")


@pytest.mark.django_db
def test_verify_security_answers_wrong_answer():
    """Reject wrong security answers"""
    q1 = SecurityQuestion.objects.create(question_text="Q1")
    q2 = SecurityQuestion.objects.create(question_text="Q2")
    q3 = SecurityQuestion.objects.create(question_text="Q3")
    user = CustomUser.objects.create_user(username="bob", email="b@example.com", password="old12345")
    for q, a in zip([q1, q2, q3], ["A1", "A2", "A3"]):
        UserSecurityAnswer.objects.create(user=user, question=q, answer=a)
    data = {
        "email": "b@example.com",
        "answers": ["wrong", "A2", "A3"],
        "new_password": "New12345"
    }
    s = VerifySecurityAnswersSerializer(data=data)
    assert not s.is_valid()


# ======================================================
# ? UserProfileSerializer
# ======================================================

@pytest.mark.django_db
def test_user_profile_serializer_updates_profile():
    """Ensure nested profile fields update correctly"""
    user = CustomUser.objects.create_user(username="charlie", email="c@example.com", password="x")
    serializer = UserProfileSerializer(instance=user, data={
        "first_name": "Charles",
        "profile": {"bio": "Updated bio", "linkedin": "https://linkedin.com/in/test"}
    }, partial=True)
    assert serializer.is_valid(), serializer.errors
    updated_user = serializer.save()
    assert updated_user.first_name == "Charles"
    assert updated_user.profile.bio == "Updated bio"


# ======================================================
# ? PostSerializer
# ======================================================

@pytest.mark.django_db
def test_post_serializer_create_with_tags():
    """PostSerializer should create post with tags"""
    factory = APIRequestFactory()
    user = CustomUser.objects.create_user(username="writer", email="w@example.com", password="x")
    tag1 = Tag.objects.create(name="django")
    tag2 = Tag.objects.create(name="rest")
    data = {"title": "Hello", "content": "World", "tags": ["django", "rest"]}
    request = factory.post("/api/posts/", data)
    request.user = user
    serializer = PostSerializer(data=data, context={"request": request})
    assert serializer.is_valid(), serializer.errors
    post = serializer.save(author=user)
    assert post.tags.count() == 2
    assert post.slug.startswith("hello")


@pytest.mark.django_db
def test_post_serializer_like_fields():
    """Ensure PostSerializer like-related fields behave correctly"""
    factory = APIRequestFactory()
    user = CustomUser.objects.create_user(username="u", email="u@example.com", password="x")
    post = Post.objects.create(author=user, title="Post A", content="test")
    request = factory.get("/")
    request.user = user
    serializer = PostSerializer(post, context={"request": request})
    data = serializer.data
    assert data["likes_count"] == 0
    assert data["liked_by_user"] is False


# ======================================================
# ? CommentSerializer & LikeSerializer
# ======================================================

@pytest.mark.django_db
def test_comment_serializer_basic_fields():
    user = CustomUser.objects.create_user(username="commenter", email="cm@example.com", password="x")
    post = Post.objects.create(author=user, title="Post B", content="hi")
    comment = Comment.objects.create(post=post, author=user, content="good post")
    serializer = CommentSerializer(comment)
    assert "author_username" in serializer.data
    assert serializer.data["content"] == "good post"


@pytest.mark.django_db
def test_like_serializer_fields():
    user = CustomUser.objects.create_user(username="liker", email="lk@example.com", password="x")
    post = Post.objects.create(author=user, title="Post C", content="hi")
    like = Like.objects.create(user=user, post=post)
    serializer = LikeSerializer(like)
    data = serializer.data
    assert data["username"] == "liker"
    assert data["post_title"] == "Post C"


# ======================================================
# ? TagSerializer & BlogExpansionRequestSerializer
# ======================================================

@pytest.mark.django_db
def test_tag_serializer_output():
    tag = Tag.objects.create(name="pytest")
    s = TagSerializer(tag)
    assert s.data["name"] == "pytest"
    assert "slug" in s.data


def test_blog_expansion_request_serializer_validation():
    """Test wordcount and prompt validation"""
    s = BlogExpansionRequestSerializer(data={"wordcount": 120, "prompt_suggestion": "AI article"})
    assert s.is_valid(), s.errors
    assert s.validated_data["wordcount"] == 120
