from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL  # Pointing to your CustomUser


class Profile(models.Model):
    # One-to-one: Each user has only one Profile; deleting the user will cascade delete the Profile.
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)
    bio = models.TextField(blank=True)
    linkedin = models.URLField(blank=True)
    github   = models.URLField(blank=True)
    facebook = models.URLField(blank=True)
    website  = models.URLField(blank=True)
    x_twitter = models.URLField(blank=True)  
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profile({self.user.username})"
