# backend/api/test/test_forgot_password_view.py
import json

import pytest
from api.models.security import SecurityQuestion, UserSecurityAnswer
from api.views.forgot_password_view import (ForgetPasswordResetView,
                                            ForgetPasswordStartView,
                                            ForgetPasswordVerifyView)
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APIRequestFactory

pytestmark = pytest.mark.django_db
User = get_user_model()


@pytest.fixture()
def factory():
    return APIRequestFactory()


@pytest.fixture()
def user():
    return User.objects.create_user(
        username="fp_user", email="fp@ex.com", password="old_password123"
    )


@pytest.fixture()
def questions(user):
    q1 = SecurityQuestion.objects.create(question_text="pet?")
    q2 = SecurityQuestion.objects.create(question_text="city?")
    UserSecurityAnswer.objects.create(user=user, question=q1, answer="cat")
    UserSecurityAnswer.objects.create(user=user, question=q2, answer="sydney")
    return [q1, q2]


# ----------------------------- Step 1: Start -----------------------------

def test_start_missing_email(factory):
    req = factory.post("/", data=json.dumps({}), content_type="application/json")
    resp = ForgetPasswordStartView.as_view()(req)
    assert resp.status_code == status.HTTP_400_BAD_REQUEST
    assert "Email is required" in str(resp.data)


def test_start_user_not_found(factory):
    req = factory.post("/", data=json.dumps({"email": "none@ex.com"}), content_type="application/json")
    resp = ForgetPasswordStartView.as_view()(req)
    assert resp.status_code == status.HTTP_404_NOT_FOUND


def test_start_returns_questions(factory, user, questions):
    req = factory.post("/", data=json.dumps({"email": user.email}), content_type="application/json")
    resp = ForgetPasswordStartView.as_view()(req)
    assert resp.status_code == status.HTTP_200_OK
    assert "questions" in resp.data
    assert isinstance(resp.data["questions"], list)
    assert len(resp.data["questions"]) >= 2
    item = resp.data["questions"][0]
    assert {"id", "question_text"} <= item.keys()


# ----------------------------- Step 2: Verify -----------------------------

def test_verify_missing_fields(factory):
    req = factory.post("/", data=json.dumps({"email": "x@ex.com"}), content_type="application/json")
    resp = ForgetPasswordVerifyView.as_view()(req)
    assert resp.status_code == status.HTTP_400_BAD_REQUEST


def test_verify_invalid_question_id(factory, user, questions):
    payload = {
        "email": user.email,
        "answers": [{"question_id": 999999, "answer": "whatever"}],
    }
    req = factory.post("/", data=json.dumps(payload), content_type="application/json")
    resp = ForgetPasswordVerifyView.as_view()(req)
    assert resp.status_code == status.HTTP_400_BAD_REQUEST
    assert "Invalid question id" in str(resp.data)


def test_verify_wrong_answer(factory, user, questions):
    payload = {
        "email": user.email,
        "answers": [
            {"question_id": questions[0].id, "answer": "dog"},     
            {"question_id": questions[1].id, "answer": "sydney"},    
        ],
    }
    req = factory.post("/", data=json.dumps(payload), content_type="application/json")
    resp = ForgetPasswordVerifyView.as_view()(req)
    assert resp.status_code == status.HTTP_400_BAD_REQUEST
    assert "incorrect" in str(resp.data).lower()


def test_verify_success_returns_reset_token(factory, user, questions):
    payload = {
        "email": user.email,
        "answers": [
            {"question_id": questions[0].id, "answer": "cat"},
            {"question_id": questions[1].id, "answer": "sydney"},
        ],
    }
    req = factory.post("/", data=json.dumps(payload), content_type="application/json")
    resp = ForgetPasswordVerifyView.as_view()(req)
    assert resp.status_code == status.HTTP_200_OK
    assert "reset_token" in resp.data
    return resp.data["reset_token"]  


# ----------------------------- Step 3: Reset -----------------------------

def test_reset_missing_fields(factory):
    req = factory.post("/", data=json.dumps({}), content_type="application/json")
    resp = ForgetPasswordResetView.as_view()(req)
    assert resp.status_code == status.HTTP_400_BAD_REQUEST


def test_reset_passwords_do_not_match(factory):
    payload = {"reset_token": "x", "new_password": "abc12345", "confirm_password": "zzz"}
    req = factory.post("/", data=json.dumps(payload), content_type="application/json")
    resp = ForgetPasswordResetView.as_view()(req)
    assert resp.status_code == status.HTTP_400_BAD_REQUEST
    assert "do not match" in str(resp.data)


def test_reset_short_password(factory):
    payload = {"reset_token": "x", "new_password": "short", "confirm_password": "short"}
    req = factory.post("/", data=json.dumps(payload), content_type="application/json")
    resp = ForgetPasswordResetView.as_view()(req)
    assert resp.status_code == status.HTTP_400_BAD_REQUEST
    assert "at least 8" in str(resp.data).lower()


def test_reset_invalid_token(factory):
    payload = {"reset_token": "totally-bad", "new_password": "abc12345", "confirm_password": "abc12345"}
    req = factory.post("/", data=json.dumps(payload), content_type="application/json")
    resp = ForgetPasswordResetView.as_view()(req)
    assert resp.status_code == status.HTTP_400_BAD_REQUEST


def test_reset_success_flow(factory, user, questions):
    req1 = factory.post("/", data=json.dumps({"email": user.email}), content_type="application/json")
    resp1 = ForgetPasswordStartView.as_view()(req1)
    assert resp1.status_code == status.HTTP_200_OK

    verify_payload = {
        "email": user.email,
        "answers": [
            {"question_id": questions[0].id, "answer": "cat"},
            {"question_id": questions[1].id, "answer": "sydney"},
        ],
    }
    req2 = factory.post("/", data=json.dumps(verify_payload), content_type="application/json")
    resp2 = ForgetPasswordVerifyView.as_view()(req2)
    assert resp2.status_code == status.HTTP_200_OK
    token = resp2.data["reset_token"]

    new_pwd = "NewPassw0rd!"
    reset_payload = {"reset_token": token, "new_password": new_pwd, "confirm_password": new_pwd}
    req3 = factory.post("/", data=json.dumps(reset_payload), content_type="application/json")
    resp3 = ForgetPasswordResetView.as_view()(req3)
    assert resp3.status_code == status.HTTP_200_OK

    user.refresh_from_db()
    assert user.check_password(new_pwd)
