from rest_framework.views import APIView
from rest_framework.response import Response

class HelloWorldView(APIView):
    """A simple GET API - returns a JSON response"""
    def get(self, request):
        return Response({"message": "Hello from API!"})