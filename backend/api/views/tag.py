# api/views/tag.py
from rest_framework import viewsets, permissions
from ..models.tag import Tag
from ..serializers.tag import TagSerializer

class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
