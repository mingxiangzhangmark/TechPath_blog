from django.contrib import admin
from .models import CustomUser
from .models import Comment, Post, Tag
from .models import Profile

admin.site.register(CustomUser)
admin.site.register(Comment)
admin.site.register(Post)
admin.site.register(Tag)
admin.site.register(Profile)