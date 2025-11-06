# This file makes the serializers directory a proper Python package

# Import and expose classes from submodules
from .post import PostSerializer
from .tag import TagSerializer
from .comment import CommentSerializer
from .like import LikeSerializer
from .UserProfileSerializer import UserProfileSerializer
from .SignupSerializer import SignupSerializer
from .gemini_prompt import BlogExpansionRequestSerializer
# Add other serializer classes as needed
# from .user import UserSerializer
# from .comment import CommentSerializer

__all__ = ['PostSerializer', 'TagSerializer', 'CommentSerializer', 'LikeSerializer', 'UserProfileSerializer','SignupSerializer', 'BlogExpansionRequestSerializer']  # List all classes that should be importable directly