# api/serializers/comment.py

from rest_framework import serializers
from ..models.comment import Comment
import html
import re

class CommentSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source='author.username', read_only=True)
    author_avatar = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['id', 'post', 'author', 'author_username','author_avatar', 'content', 'created_at', 'updated_at']
        read_only_fields = ['id', 'author', 'author_username','author_avatar', 'created_at', 'updated_at']
    
    def get_author_avatar(self, obj):
        """
        get the URL of the author's avatar.
        """
        if hasattr(obj.author, 'profile') and obj.author.profile.avatar:
            request = self.context.get('request')
            avatar_url = obj.author.profile.avatar.url
            if request:
                return request.build_absolute_uri(avatar_url)
            return avatar_url
        return None

    def validate_content(self, value):
        """Validate content to prevent XSS attacks"""
        if not value:
            return value

        # SQL Injection detection
        sql_patterns = [
            r'\b(union|select|insert|update|delete|drop|create|alter)\b',
            r'(\||\||&&)',
            r'(\'.*or.*\'.*=.*\')',
            r'(;|\-\-)',
            r'(\bconcat\b|\bchar\b)',
        ]
        
        for pattern in sql_patterns:
            if re.search(pattern, value, re.IGNORECASE):
                raise serializers.ValidationError("Content contains unsafe SQL characters")

        # XSS detection
        xss_patterns = [
            r'<script[^>]*>.*?</script>',
            r'javascript:',
            r'on\w+\s*=',
            r'<iframe[^>]*>',
            r'<object[^>]*>',
            r'<embed[^>]*>',
            r'eval\s*\(',
        ]
        
        for pattern in xss_patterns:
            if re.search(pattern, value, re.IGNORECASE):
                raise serializers.ValidationError("Content contains unsafe content")

        # HTML escape
        return html.escape(value)
