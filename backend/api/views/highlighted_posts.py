# api/views/highlighted_posts.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from ..models.post import Post
from ..serializers.post import PostSerializer
from django.db.models import Count

class HighlightedPostsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        # 6 latest
        latest_posts = Post.objects.filter(is_published=True).order_by('-created_at')[:6]

        # 6 of the most liked articles
        most_liked_posts = Post.objects.filter(is_published=True)\
                                       .annotate(num_likes=Count('likes'))\
                                       .order_by('-num_likes', '-created_at')[:6]

        latest_data = PostSerializer(latest_posts, many=True, context={'request': request}).data
        liked_data = PostSerializer(most_liked_posts, many=True, context={'request': request}).data

        return Response({
            "latest": latest_data,
            "most_liked": liked_data
        })
