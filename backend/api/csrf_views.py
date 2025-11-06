"""
CSRF Protection Views
"""
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import logging

logger = logging.getLogger(__name__)

def csrf_failure_view(request, reason=""):
    """
    Custom CSRF failure view that returns JSON response
    """
    logger.warning(f"CSRF failure: {reason} for {request.path}")
    
    return JsonResponse({
        'error': 'CSRF token verification failed',
        'message': 'CSRF token verification failed, please refresh the page and try again',
        'reason': reason
    }, status=403)

class CSRFExemptMixin:
    """
    CSRF exemption mixin for JWT-authenticated APIs
    """
    @method_decorator(csrf_exempt)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)
