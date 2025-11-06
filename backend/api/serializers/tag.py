# api/serializers/tag.py
from rest_framework import serializers
from ..models.tag import Tag

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug']
        read_only_fields = ['id', 'slug']
