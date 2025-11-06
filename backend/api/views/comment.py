# ✅ api/views/comment.py
from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ..models.comment import Comment
from ..serializers.comment import CommentSerializer
from django_filters.rest_framework import DjangoFilterBackend

from ..serializers.myComment import MyCommentItemSerializer


class IsAuthorOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user and (request.user == obj.author or request.user.is_admin_user)

class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.select_related('post', 'author').all().order_by('-created_at')
    serializer_class = CommentSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['post__id']  # Support /api/comments/?search=1 to filter comments with post ID = 1
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['author', 'post']  # support ?author=<id>&post=<id>

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsAuthorOrAdmin()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def mine(self, request):
        try:
            limit = int(request.query_params.get('limit', 50))
        except ValueError:
            limit = 50
        limit = max(1, min(limit, 100))

        qs = (self.get_queryset()
        .filter(author=request.user)
        .order_by('-created_at')[:limit])

        data = MyCommentItemSerializer(qs, many=True, context={'request': request}).data
        return Response(data)