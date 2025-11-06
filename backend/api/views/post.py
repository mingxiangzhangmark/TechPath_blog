from rest_framework import viewsets, permissions
from ..models.post import Post
from ..serializers.post import PostSerializer
from django_filters.rest_framework import DjangoFilterBackend, FilterSet, CharFilter
from rest_framework import filters
from ..models.tag import Tag
from ..security_decorators import safe_query, validate_search_params  # added import

class IsPostAuthorOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user and (request.user == obj.author or request.user.is_admin_user)

class PostFilter(FilterSet):
    tags = CharFilter(field_name='tags__name', lookup_expr='iexact')  # Support tags=name queries

    class Meta:
        model = Post
        fields = ['author', 'tags']

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    lookup_field = 'slug'
    filter_backends = [
        DjangoFilterBackend,
        filters.OrderingFilter,
        filters.SearchFilter
    ]
    filterset_class = PostFilter
    ordering_fields = ['created_at', 'updated_at']
    search_fields = ['title', 'content']
    # filterset_fields = ['author']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsPostAuthorOrAdmin()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    @safe_query
    @validate_search_params()
    def list(self, request, *args, **kwargs):
        """Safe list query"""
        return super().list(request, *args, **kwargs)

    @safe_query
    def get_queryset(self):
        queryset = Post.objects.all()
        tag_name = self.request.query_params.get('tags')
        if tag_name:
            queryset = queryset.filter(tags__name=tag_name, is_published=True)
        return queryset