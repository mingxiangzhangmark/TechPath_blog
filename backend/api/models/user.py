from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    address = models.TextField(blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    is_admin_user = models.BooleanField(default=False)

    def __str__(self):
        return self.username
