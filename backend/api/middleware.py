"""
Basic XSS Protection Middleware 
"""
import re
import html
from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin


class SimpleXSSProtectionMiddleware(MiddlewareMixin):
    """
    A simple middleware to provide basic XSS protection by inspecting request bodies
    """

    # only check for the most  dangerous XSS patterns
    DANGEROUS_PATTERNS = [
        r'<script[^>]*>.*?</script>',  # script tags
        r'javascript:',               # javascript protocol
        r'on\w+\s*=\s*["\'][^"\']*["\']',  # event handler attributes
        r'eval\s*\(',                 # eval function
        r'expression\s*\(',           # CSS expression
        r'<iframe[^>]*src\s*=',       # iframe with src
        r'<object[^>]*data\s*=',      # object with data
        r'<embed[^>]*src\s*=',        # embed with src
    ]

    # allowed API endpoints (no strict checking)
    ALLOWED_ENDPOINTS = [
        '/api/posts/',
        '/api/comments/',
        '/api/gemini/',
    ]
    
    # API endpoints that may contain  HTML content (allow basic HTML tags)
    HTML_CONTENT_ENDPOINTS = [
        '/api/posts/',
        '/api/comments/',
        '/api/gemini/',
        '/api/generate-blog/',
    ]

    # API endpoints that require strict checking (no scripts allowed)
    STRICT_CHECK_ENDPOINTS = [
        '/api/profile/',
        '/api/signup/',
        '/api/login/',
        '/api/admin-panel/',
        '/api/forget-password/',
    ]

    # API endpoints that completely skip checks (read-only operations)
    SKIP_CHECK_ENDPOINTS = [
        '/api/highlighted-posts/',
        '/api/tags/',
    ]
    
    def __init__(self, get_response):
        self.get_response = get_response
        self.compiled_patterns = [re.compile(pattern, re.IGNORECASE | re.DOTALL) 
                                for pattern in self.DANGEROUS_PATTERNS]
    
    def __call__(self, request):
        # Check if it's an allowed endpoint
        is_allowed_endpoint = any(request.path.startswith(endpoint) 
                                for endpoint in self.ALLOWED_ENDPOINTS)

        # For non-allowed endpoints, perform XSS checks
        if not is_allowed_endpoint and request.method in ['POST', 'PUT', 'PATCH']:
            if hasattr(request, 'body') and request.body:
                try:
                    body_str = request.body.decode('utf-8', errors='ignore')
                    if self._contains_dangerous_xss(body_str):
                        return JsonResponse({
                            'error': 'Potential XSS attack detected',
                            'message': 'Your input contains unsafe content.'
                        }, status=400)
                except:
                    pass
        
        response = self.get_response(request)
        
        # Set security headers
        response['X-XSS-Protection'] = '1; mode=block'
        response['X-Content-Type-Options'] = 'nosniff'
        response['X-Frame-Options'] = 'DENY'
        
        return response
    
    def _contains_dangerous_xss(self, text):
        """Check if the text contains dangerous XSS patterns"""
        for pattern in self.compiled_patterns:
            if pattern.search(text):
                return True
        return False
    
    def _contains_any_html(self, text):
        """Check if the text contains any HTML tags"""
        html_pattern = re.compile(r'<[^>]+>', re.IGNORECASE)
        return bool(html_pattern.search(text))
    
    def _add_security_headers(self, response):
        """Add security headers to response"""
        response['X-XSS-Protection'] = '1; mode=block'
        response['X-Content-Type-Options'] = 'nosniff'
        response['X-Frame-Options'] = 'DENY'
        return response
    
    def _sanitize_text(self, text):
        """Basic text sanitization"""
        if not text:
            return text

        # HTML escape
        text = html.escape(text)

        # Remove dangerous patterns
        for pattern in self.compiled_patterns:
            text = pattern.sub('', text)
        
        return text
