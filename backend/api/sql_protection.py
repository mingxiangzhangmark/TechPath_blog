"""
Simple SQL Injection Protection Middleware
"""
import re
import logging
from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin

logger = logging.getLogger(__name__)

class SimpleSQLInjectionProtectionMiddleware(MiddlewareMixin):
    """
    A simple middleware to provide basic SQL injection protection by inspecting
    incoming requests for dangerous SQL patterns.
    """

    # Dangerous SQL patterns to check for
    DANGEROUS_SQL_PATTERNS = [
        r'(\bunion\s+select\b)',           # UNION SELECT
        r'(\bor\s+\d+\s*=\s*\d+)',        # OR 1=1
        r'(\band\s+\d+\s*=\s*\d+)',       # AND 1=1
        r'(\'.*or.*\'.*=.*\')',           # String OR injection
        r'(\-\-)',                        # SQL comment
        r'(\/\*.*\*\/)',                  # SQL multi-line comment
        r'(\bdrop\s+table\b)',            # DROP TABLE
        r'(\bdelete\s+from\b)',           # DELETE FROM
        r'(\btruncate\b)',                # TRUNCATE
        r'(\bexec\b|\bexecute\b)',        # EXEC/EXECUTE
        r'(\bwaitfor\s+delay\b)',         # Time-based attack
        r'(\bload_file\b|\boutfile\b)',   # File operations
    ]
    
   
    CRITICAL_SQL_PATTERNS = [
        r'(\bunion\s+select\b.*from\b)',   #  UNION SELECT with FROM
        r'(\bor\s+\d+\s*=\s*\d+\s*--)',   # OR 1=1 with comment
        r'(\band\s+\d+\s*=\s*\d+\s*--)',  # AND 1=1 with comment
        r'(\bdrop\s+table\s+\w+)',        # DROP TABLE with table name
        r'(\bdelete\s+from\s+\w+)',       # DELETE FROM with table name
    ]

    # Allowed content endpoints (no strict SQL checks)
    CONTENT_ENDPOINTS = [
        '/api/posts/',
        '/api/comments/',
        '/api/generate-blog/',
        '/api/gemini/',
        '/api/profile/',          
    ]

    # Strictly checked endpoints
    STRICT_CHECK_ENDPOINTS = [
        '/api/login/',
        '/api/signup/',
        '/api/admin-panel/',
    ]
    
    
    MODERATE_CHECK_ENDPOINTS = [
        '/api/forgot-password/',
    ]
    
    def __init__(self, get_response):
        self.get_response = get_response
        self.compiled_patterns = [
            re.compile(pattern, re.IGNORECASE | re.MULTILINE) 
            for pattern in self.DANGEROUS_SQL_PATTERNS
        ]
        # 为内容端点使用更严格的模式
        self.critical_patterns = [
            re.compile(pattern, re.IGNORECASE | re.MULTILINE)
            for pattern in self.CRITICAL_SQL_PATTERNS
        ]
    
    def __call__(self, request):
        # Determine the type of endpoint
        is_content_endpoint = any(request.path.startswith(endpoint) 
                                for endpoint in self.CONTENT_ENDPOINTS)
        is_strict_endpoint = any(request.path.startswith(endpoint) 
                               for endpoint in self.STRICT_CHECK_ENDPOINTS)
        is_moderate_endpoint = any(request.path.startswith(endpoint)
                                 for endpoint in self.MODERATE_CHECK_ENDPOINTS)

        # Content endpoints only check for the most dangerous patterns
        if is_content_endpoint:
            pass

        # Strictly check all parameters for strict endpoints
        elif is_strict_endpoint:
            if self._check_query_params(request):
                logger.warning(f"SQL Injection attempt in URL params: {request.GET}")
                return JsonResponse({
                    'error': 'Invalid request parameters',
                    'message': 'The request parameters contain illegal characters'
                }, status=400)
            
            if request.method in ['POST', 'PUT', 'PATCH']:
                if self._check_request_body(request):
                    logger.warning(f"SQL Injection attempt in request body")
                    return JsonResponse({
                        'error': 'Invalid request data',
                        'message': 'The request body contains illegal characters'
                    }, status=400)

        # Moderate check endpoints - only check for critical SQL patterns
        elif is_moderate_endpoint:
            if request.method in ['POST', 'PUT', 'PATCH']:
                if self._check_dangerous_sql_only(request):
                    logger.warning(f"Critical SQL injection detected in moderate endpoint: {request.path}")
                    return JsonResponse({
                        'error': 'Dangerous SQL detected',
                        'message': 'The request contains dangerous SQL patterns'
                    }, status=400)

        # Other endpoints standard checks
        else:
            if self._check_query_params(request):
                logger.warning(f"SQL Injection attempt in URL params: {request.GET}")
                return JsonResponse({
                    'error': 'Invalid request parameters',
                    'message': 'The request parameters contain illegal characters'
                }, status=400)
        
        response = self.get_response(request)
        return response
    
    def _check_query_params(self, request):
        """Check query parameters"""
        for key, value in request.GET.items():
            if self._contains_sql_injection(value):
                return True
        return False
    
    def _check_request_body(self, request):
        """Check request body"""
        if hasattr(request, 'body') and request.body:
            try:
                body_str = request.body.decode('utf-8', errors='ignore')
                return self._contains_sql_injection(body_str)
            except:
                return False
        return False
    
    def _contains_sql_injection(self, text):
        """Check for SQL injection patterns"""
        if not text or not isinstance(text, str):
            return False

        # Check for SQL injection patterns
        for pattern in self.compiled_patterns:
            if pattern.search(text):
                return True
        
        return False
    
    def _is_safe_value(self, value):
        """Check if the value is safe (contains only alphanumeric and basic characters)"""
        if not value:
            return True
        # Allow letters, numbers, spaces, and basic punctuation
        safe_pattern = re.compile(r'^[a-zA-Z0-9\s\-_@.]+$')
        return bool(safe_pattern.match(value))
    
    def _check_dangerous_sql_only(self, request):
        """Check only for the most dangerous SQL patterns in the request body"""
        if hasattr(request, 'body') and request.body:
            try:
                body_str = request.body.decode('utf-8', errors='ignore')
                return self._contains_dangerous_sql(body_str)
            except:
                return False
        return False
    
    def _contains_dangerous_sql(self, text):
        """Check for dangerous SQL injection patterns - content endpoints only"""
        if not text or not isinstance(text, str):
            return False

        # For content endpoints, only check the most critical SQL injection patterns
        for pattern in self.critical_patterns:
            if pattern.search(text):
                return True
        
        return False
