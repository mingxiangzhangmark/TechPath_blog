"""
Safe Query Decorators 
"""
import functools
import logging
from django.core.exceptions import ValidationError
from django.db import connection
from django.http import JsonResponse

logger = logging.getLogger(__name__)

def safe_query(func):
    """
    Safe query decorator to monitor and log database queries
    """
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        # Record the state before the query
        queries_before = len(connection.queries)
        
        try:
            result = func(*args, **kwargs)

            # Record the state after the query
            queries_after = len(connection.queries)
            query_count = queries_after - queries_before
            
            # 检查是否有可疑的查询
            if query_count > 10:  # 如果查询数量过多，记录警告
                logger.warning(f"High query count detected: {query_count} queries in {func.__name__}")
            
            # Check for dangerous SQL patterns
            recent_queries = connection.queries[queries_before:]
            for query in recent_queries:
                sql = query.get('sql', '').lower()
                if any(dangerous in sql for dangerous in ['drop', 'truncate', 'delete from', 'update set']):
                    logger.warning(f"Potentially dangerous SQL detected: {sql[:100]}...")
            
            return result
            
        except Exception as e:
            logger.error(f"Database error in {func.__name__}: {str(e)}")
            raise
    
    return wrapper

def validate_search_params(search_fields=None):
    """
    Search parameter validation decorator
    """
    def decorator(func):
        @functools.wraps(func)
        def wrapper(self, request, *args, **kwargs):
            # Validate search parameters
            search = request.GET.get('search', '')
            if search:
                # Check search content length
                if len(search) > 100:
                    return JsonResponse({
                        'error': 'Search term too long',
                        'message': 'Search term exceeds maximum length of 100 characters'
                    }, status=400)

                # Check for dangerous characters
                dangerous_chars = ['\'', '"', ';', '--', '/*', '*/', 'union', 'select']
                search_lower = search.lower()
                if any(char in search_lower for char in dangerous_chars):
                    return JsonResponse({
                        'error': 'Invalid search parameters',
                        'message': 'Search term contains unsafe characters'
                    }, status=400)
            
            return func(self, request, *args, **kwargs)
        return wrapper
    return decorator
