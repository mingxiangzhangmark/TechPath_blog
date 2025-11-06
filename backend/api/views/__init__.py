# This file makes the views directory a proper Python package

# Import and expose classes from submodules
from .post import PostViewSet
from .base import HelloWorldView
from .auth import SignupView, MyTokenObtainPairView, LogoutView
from .user import UserProfileView
from .admin import AdminUserManagementView, AdminStatusSerializer
from .comment import CommentViewSet
from .tag import TagViewSet
from .like import LikeViewSet
from .highlighted_posts import HighlightedPostsView
from .gemini_blog_view import BlogExpansionAPIView
from .google_one_tap import GoogleOneTapLoginAPIView

# List all classes that should be importable directly from api.views
__all__ = [
    'PostViewSet',
    'HelloWorldView',
    'SignupView', 
    'MyTokenObtainPairView',
    'LogoutView',
    'UserProfileView',
    'AdminUserManagementView',
    'AdminStatusSerializer',
    'TagViewSet',
    'CommentViewSet',
    'LikeViewSet',
    'HighlightedPostsView',
    'BlogExpansionAPIView',
    'GoogleOneTapLoginAPIView'
]