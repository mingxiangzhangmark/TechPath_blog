import uuid

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from ..exceptions import log
from ..serializers.gemini_prompt import BlogExpansionRequestSerializer
from ..utils.gemini_utils import generate_blog_text

class BlogExpansionAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = BlogExpansionRequestSerializer(data=request.data)
        if serializer.is_valid():
            wordcount = serializer.validated_data["wordcount"]
            prompt = serializer.validated_data["prompt_suggestion"]
            try:
                blog_text = generate_blog_text(prompt, wordcount)
                return Response({"blog_text": blog_text})
            except Exception as e:
                rid = str(uuid.uuid4())
                log.exception("Blog expansion failed [%s]: %s", rid, e)
                return Response({"error": "GENERATION_FAILED", "request_id": rid}, status=status.HTTP_502_BAD_GATEWAY)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
