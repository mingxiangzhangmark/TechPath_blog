# backend/api/models/security.py
from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL


class SecurityQuestion(models.Model):
    question_text = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.question_text


class UserSecurityAnswer(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='security_answers')
    question = models.ForeignKey(SecurityQuestion, on_delete=models.CASCADE)
    answer = models.CharField(max_length=255)

    class Meta:
        unique_together = ('user', 'question')

    def __str__(self):
        return f"{self.user.username} - {self.question.question_text}"