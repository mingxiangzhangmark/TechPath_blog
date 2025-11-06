from django.db import models
from django.utils.text import slugify


class Tag(models.Model):
    name = models.CharField(max_length=30, unique=True)
    slug = models.SlugField(max_length=40, unique=True, blank=True)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        # Auto-generation of slugs (only on creation)
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            num = 1

            while Tag.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{num}"
                num += 1

            self.slug = slug

        super().save(*args, **kwargs)
