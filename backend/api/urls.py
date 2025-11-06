from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from dj_rest_auth.registration.views import SocialLoginView
from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views.forgot_password_view import ForgetPasswordStartView, ForgetPasswordVerifyView, ForgetPasswordResetView

# Import from the views package
from .views import (AdminUserManagementView, BlogExpansionAPIView,
                    CommentViewSet, GoogleOneTapLoginAPIView, HelloWorldView,
                    HighlightedPostsView, LikeViewSet, LogoutView,
                    MyTokenObtainPairView, PostViewSet, SignupView, TagViewSet,
                    UserProfileView)

router = DefaultRouter()
router.register(r'posts', PostViewSet, basename='post')
router.register(r'tags', TagViewSet, basename='tag')
router.register(r'comments', CommentViewSet, basename='comment')
router.register(r'likes', LikeViewSet, basename='like')

class GoogleLogin(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter

urlpatterns = [
    path('hello/', HelloWorldView.as_view(), name='hello'),
    path('signup/', SignupView.as_view(), name='signup'),
    path('', include(router.urls)),
    path('login/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('admin-panel/', AdminUserManagementView.as_view(), name='admin_panel'),
    path('admin-panel/<int:user_id>/', AdminUserManagementView.as_view(), name='admin_user_ops'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('highlighted-posts/', HighlightedPostsView.as_view(), name='highlighted-posts'),
    path('generate-blog/', BlogExpansionAPIView.as_view(), name='generate-blog'),
    path('google/login/', GoogleOneTapLoginAPIView.as_view(), name='google-login'),
    path('forget-password/start/', ForgetPasswordStartView.as_view(), name='forget-password-start'),
    path('forget-password/verify/', ForgetPasswordVerifyView.as_view(), name='forget-password-verify'),
    path('forget-password/reset/', ForgetPasswordResetView.as_view(), name='forget-password-reset'),
]