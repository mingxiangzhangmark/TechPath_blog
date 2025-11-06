from django.db import models
from django.conf import settings
from django.utils.text import slugify
from .tag import Tag  

User = settings.AUTH_USER_MODEL


class Post(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, blank=True)
    content = models.TextField()
    cover = models.ImageField(upload_to="post_covers/", blank=True, null=True)
    is_published = models.BooleanField(default=False)

    tags = models.ManyToManyField(Tag, related_name="posts", blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["author"]),
            models.Index(fields=["is_published", "created_at"]),
        ]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            num = 1

            while Post.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{num}"
                num += 1

            self.slug = slug

        super().save(*args, **kwargs)
