# backend/api/test/test_signals.py
import pytest
from api.models.profile import Profile
from api.models.security import SecurityQuestion
from api.models.tag import Tag
from api.signals import (create_default_security_questions,
                         create_default_tags, create_or_update_user_profile)
from django.contrib.auth import get_user_model

pytestmark = pytest.mark.django_db
User = get_user_model()


def test_profile_created_on_user_create():
    u = User.objects.create_user(username="sig_user", email="s@ex.com", password="x")
    assert Profile.objects.filter(user=u).exists()


def test_profile_persist_on_user_save_again():
    u = User.objects.create_user(username="sig_user2", email="s2@ex.com", password="x")
    u.first_name = "changed"
    u.save()
    assert Profile.objects.filter(user =u).exists()


def test_create_default_tags_idempotent():
    create_default_tags(sender=None)
    subset = {"python", "django", "react", "postgresql", "security", "other"}
    found = set(Tag.objects.filter(name__in=subset).values_list("name", flat=True))
    assert subset <= found

    total1 = Tag.objects.count()
    create_default_tags(sender=None)
    total2 = Tag.objects.count()
    assert total1 == total2


def test_create_default_security_questions_idempotent():
    create_default_security_questions(sender=None)
    names = set(SecurityQuestion.objects.values_list("question_text", flat=True))
    must_have = {
        "What is your favourite colour?",
        "What is your favourite animal?",
        "What is your favourite food?",
    }
    assert must_have <= names

    total1 = SecurityQuestion.objects.count()
    create_default_security_questions(sender=None)
    total2 = SecurityQuestion.objects.count()
    assert total1 == total2
