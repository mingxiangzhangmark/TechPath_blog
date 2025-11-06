# api/serializers/like.py
from rest_framework import serializers
from ..models.like import Like

class LikeSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    post_title = serializers.CharField(source='post.title', read_only=True)

    class Meta:
        model = Like
        fields = ['id', 'user', 'username', 'post', 'post_title', 'created_at']
        read_only_fields = ['id', 'created_at', 'username', 'post_title', 'user']
