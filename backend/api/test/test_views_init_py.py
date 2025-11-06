# backend/api/test/test_views_init_py.py
import importlib
import inspect

import pytest

EXPECTED_EXPORTS = {
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
    'GoogleOneTapLoginAPIView',
}

@pytest.mark.parametrize("module_name", ["api.views"])
def test_views_init_has_all(module_name):
    m = importlib.import_module(module_name)
    assert hasattr(m, "__all__"), "__all__ missing in api.views"
    assert set(m.__all__) == EXPECTED_EXPORTS, "api.views.__all__ not matching expected exports"

@pytest.mark.parametrize("name", sorted(list(EXPECTED_EXPORTS)))
def test_each_symbol_importable(name):
    m = importlib.import_module("api.views")
    obj = getattr(m, name, None)
    assert obj is not None, f"{name} is not importable from api.views"
    assert inspect.isclass(obj) or inspect.isfunction(obj) or inspect.ismodule(obj)

def _is_viewset(cls):
    try:
        from rest_framework.viewsets import ViewSetMixin
        return inspect.isclass(cls) and issubclass(cls, ViewSetMixin)
    except Exception:
        return False

def _is_apiview(cls):
    try:
        from rest_framework.views import APIView
        return inspect.isclass(cls) and issubclass(cls, APIView)
    except Exception:
        return False

@pytest.mark.parametrize("name", [
    "PostViewSet", "TagViewSet", "CommentViewSet", "LikeViewSet"
])
def test_viewset_like_exports_are_viewsets(name):
    m = importlib.import_module("api.views")
    cls = getattr(m, name)
    assert _is_viewset(cls), f"{name} should be a DRF ViewSet"

@pytest.mark.parametrize("name", [
    "HelloWorldView", "SignupView", "MyTokenObtainPairView", "LogoutView",
    "UserProfileView", "AdminUserManagementView", "HighlightedPostsView",
    "BlogExpansionAPIView", "GoogleOneTapLoginAPIView"
])
def test_view_like_exports_are_apiviews(name):
    m = importlib.import_module("api.views")
    cls = getattr(m, name)
    assert _is_apiview(cls), f"{name} should be a DRF APIView (or subclass)"

def test_import_star_respects_all(monkeypatch):

    m = importlib.import_module("api.views")
    namespace = {}
    for sym in m.__all__:
        namespace[sym] = getattr(m, sym)
    assert set(namespace.keys()) == set(m.__all__)
