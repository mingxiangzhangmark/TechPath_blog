# api/views/like.py

from rest_framework import viewsets, permissions
from rest_framework.exceptions import PermissionDenied
from ..models.like import Like
from ..serializers.like import LikeSerializer


class LikeViewSet(viewsets.ModelViewSet):
    http_method_names = ["get", "post", "delete", "head", "options"]
    queryset = Like.objects.all()
    serializer_class = LikeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def perform_destroy(self, instance):
        if instance.user != self.request.user:
            raise PermissionDenied("You can only remove your own like.")
        instance.delete()
