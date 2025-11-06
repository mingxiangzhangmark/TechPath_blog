import hashlib
import uuid

import jwt
from django.conf import settings
from django.contrib.auth import authenticate, get_user_model
from django.core.cache import cache
from django.db import transaction
from rest_framework import serializers, status
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from ..exceptions import log
from ..permissions import IsAdminUserFlag
from ..serializers.SignupSerializer import SignupSerializer
from ..serializers.UserProfileSerializer import UserProfileSerializer

CustomUser = get_user_model()

class SignupView(APIView):
    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User created successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MyTokenObtainPairSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        username_or_email = attrs.get('username')
        password = attrs.get('password')

        # First try to authenticate with username
        user = authenticate(username=username_or_email, password=password)

        # If failed, try to authenticate with email
        if user is None:
            try:
                user_obj = CustomUser.objects.get(email=username_or_email)
                user = authenticate(username=user_obj.username, password=password)
            except CustomUser.DoesNotExist:
                raise AuthenticationFailed("Username or email does not exist")

        if user is None or not user.is_active:
            raise AuthenticationFailed("Username/email or password is incorrect")

        self.user = user

        # Create refresh + access token
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        # Hash and save to DatabaseCache
        hashed_token = hashlib.sha256(access_token.encode()).hexdigest()
        cache_key = f"user:{user.id}:access_hash"
        cache.set(cache_key, hashed_token, timeout=int(settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds()))

        return {
            'refresh': str(refresh),
            'access': access_token,
            'username': user.username,
            'email': user.email,
            'is_admin_user': user.is_admin_user
        }

class MyTokenObtainPairView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = MyTokenObtainPairSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data)

class LogoutView(APIView):
    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            access_token = request.data.get("access")

            # Add Refresh Token to blacklist
            token = RefreshToken(refresh_token)
            token.blacklist()

            # If access token is provided, delete the hash from Redis
            if access_token:
                # Decode access token to get user_id
                try:
                    decoded = jwt.decode(
                        access_token,
                        settings.SIMPLE_JWT['SIGNING_KEY'],
                        algorithms=[settings.SIMPLE_JWT['ALGORITHM']],
                    )
                    user_id = decoded.get("user_id")
                except jwt.ExpiredSignatureError:
                    return Response({"error": "Access token expired"}, status=status.HTTP_401_UNAUTHORIZED)
                except jwt.InvalidTokenError:
                    return Response({"error": "Invalid access token"}, status=status.HTTP_400_BAD_REQUEST)

                # Construct cache key
                cache_key = f"user:{user_id}:access_hash"
                cache.delete(cache_key)

            return Response({"message": "Logged out successfully"}, status=status.HTTP_205_RESET_CONTENT)

        except KeyError:
            return Response({"error": "Missing refresh token"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            rid = str(uuid.uuid4())
            log.exception("Logout failed [%s]: %s", rid, e)
            return Response({"error": "LOGOUT_FAILED", "request_id": rid}, status=status.HTTP_400_BAD_REQUEST)

class AdminStatusSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    is_admin_user = serializers.BooleanField()

class AdminUserManagementView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUserFlag]

    def get(self, request):
        users = CustomUser.objects.all()
        serializer = UserProfileSerializer(users, many=True)
        return Response(serializer.data)

    def put(self, request):
        """
        Update a user's admin flag.
        Accepts JSON bool or string "true"/"false".
        Returns updated user object (minimal) to avoid serializer crashes.
        """
        data = request.data

        # Coerce possible string booleans
        if 'is_admin_user' in data and isinstance(data['is_admin_user'], str):
            if data['is_admin_user'].lower() in ('true', '1', 'yes'):
                data['is_admin_user'] = True
            elif data['is_admin_user'].lower() in ('false', '0', 'no'):
                data['is_admin_user'] = False

        serializer = AdminStatusSerializer(data=data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate user exists
        try:
            user = CustomUser.objects.get(id=serializer.validated_data['user_id'])
        except CustomUser.DoesNotExist:
            return Response({"error": f"User with ID {serializer.validated_data['user_id']} not found"}, 
                           status=status.HTTP_404_NOT_FOUND)

        # Update admin status
        with transaction.atomic():
            user.is_admin_user = serializer.validated_data['is_admin_user']
            user.save()
        
        # Return minimal user info to avoid serialization issues
        return Response({
            "id": user.id,
            "username": user.username,
            "is_admin_user": user.is_admin_user
        })

    def delete(self, request, user_id):
        """Delete a user account"""
        try:
            # Prevent self-deletion
            if int(user_id) == request.user.id:
                return Response(
                    {"error": "Cannot delete your own account"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            user = CustomUser.objects.get(id=user_id)
            username = user.username
            user.delete()
            return Response({"message": f"User {username} deleted successfully"})
        except CustomUser.DoesNotExist:
            return Response(
                {"error": f"User with ID {user_id} not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )