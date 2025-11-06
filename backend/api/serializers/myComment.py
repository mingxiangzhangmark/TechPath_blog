# api/serializers/comment_my_list.py
from rest_framework import serializers
from ..models.comment import Comment

class MyCommentItemSerializer(serializers.ModelSerializer):
    postTitle = serializers.CharField(source='post.title', read_only=True)
    postId = serializers.IntegerField(source='post_id', read_only=True)
    postSlug = serializers.SlugField(source='post.slug', read_only=True)
    createdAt = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['id', 'postTitle', 'postId', 'content', 'createdAt', 'postSlug']

    def get_createdAt(self, obj):
        return obj.created_at.date().isoformat()
