from rest_framework import serializers
from ..models.post import Post
from ..models.tag import Tag
from ..serializers.comment import CommentSerializer
import html
import re


class PostSerializer(serializers.ModelSerializer):
    tags = serializers.SlugRelatedField(
        many=True,
        slug_field='name',
        queryset=Tag.objects.all()
    )

    author_username = serializers.CharField(source='author.username', read_only=True)
    author_avatar = serializers.SerializerMethodField()
    comments = CommentSerializer(many=True, read_only=True)

    likes_count = serializers.SerializerMethodField()
    liked_by_user = serializers.SerializerMethodField()
    like_id = serializers.SerializerMethodField() 

    class Meta:
        model = Post
        fields = [
            'id', 'author', 'author_username', 'title', 'slug', 'content',
            'cover', 'is_published', 'tags', 'created_at', 'updated_at', 'comments',
            'likes_count', 'liked_by_user', 'author_avatar','like_id'
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at', 'author', 'author_username', 'comments', 'author_avatar']


    def get_likes_count(self, obj):
        return obj.likes.count()
    def get_liked_by_user(self, obj):
        user = self.context['request'].user
        return obj.likes.filter(user=user).exists() if user.is_authenticated else False
    def get_author_avatar(self, obj):
        if hasattr(obj.author, 'profile') and obj.author.profile.avatar:
            request = self.context.get('request')
            avatar_url = obj.author.profile.avatar.url
            if request:
                return request.build_absolute_uri(avatar_url)
            return avatar_url
        return None

    def create(self, validated_data):
        tags = validated_data.pop('tags', [])
        post = Post.objects.create(**validated_data)
        post.tags.set(tags)
        return post

    def update(self, instance, validated_data):
        tags = validated_data.pop('tags', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if tags is not None:
            instance.tags.set(tags)
        return instance

    def get_like_id(self, obj):
        user = self.context['request'].user
        if user.is_authenticated:
            like = obj.likes.filter(user=user).first()
            return like.id if like else None
        return None

    def validate_title(self, value):
        """check title to prevent XSS attacks"""
        if not value:
            return value

        # SQL Injection detection
        sql_patterns = [
            r'\b(union|select|insert|update|delete|drop|create|alter)\b',
            r'(\||\||&&)',
            r'(\'.*or.*\'.*=.*\')',
            r'(;|\-\-)',
        ]
        
        for pattern in sql_patterns:
            if re.search(pattern, value, re.IGNORECASE):
                raise serializers.ValidationError("Title contains unsafe SQL characters")

        # XSS detection - only check the most dangerous patterns
        dangerous_patterns = [
            r'<script[^>]*>.*?</script>',
            r'javascript:',
            r'on\w+\s*=',
        ]
        
        for pattern in dangerous_patterns:
            if re.search(pattern, value, re.IGNORECASE):
                raise serializers.ValidationError("Title contains unsafe content")

        # HTML escape
        return html.escape(value)
    
    def validate_content(self, value):
        """check content to prevent XSS attacks (allow basic HTML tags, only check for dangerous scripts)"""
        if not value:
            return value

        # only check for the most dangerous script patterns
        dangerous_patterns = [
            r'<script[^>]*>.*?</script>',
            r'javascript:',
            r'on\w+\s*=\s*["\'][^"\']*["\']',  # event handler
            r'eval\s*\(',
        ]
        
        for pattern in dangerous_patterns:
            if re.search(pattern, value, re.IGNORECASE):
                raise serializers.ValidationError("Content contains unsafe content")

        # Blog content requires HTML tags, so no escaping is performed
        return value