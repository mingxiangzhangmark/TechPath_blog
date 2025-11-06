# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from google.oauth2 import id_token
from google.auth.transport import requests
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings

User = get_user_model()

class GoogleOneTapLoginAPIView(APIView):
    def post(self, request):
        token = request.data.get("credential")
        if not token:
            return Response({"error": "Missing credential"}, status=400)

        try:
            idinfo = id_token.verify_oauth2_token(token, requests.Request(), settings.SOCIALACCOUNT_PROVIDERS['google']['APP']['client_id'])

            email = idinfo.get('email')
            first_name = idinfo.get('given_name')
            last_name = idinfo.get('family_name')

            if not email:
                return Response({"error": "Email not available"}, status=400)

            user, created = User.objects.get_or_create(email=email, defaults={
                "username": email.split("@")[0],
                "first_name": first_name,
                "last_name": last_name,
                "address": "",
                "phone_number": ""
            })

            refresh = RefreshToken.for_user(user)

            return Response({
                "token": str(refresh.access_token),
                "refresh": str(refresh),
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "username": user.username,
                }
            })

        except ValueError:
            return Response({"error": "Invalid token"}, status=400)
