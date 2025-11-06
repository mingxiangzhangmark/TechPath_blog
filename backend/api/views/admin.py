
from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework import serializers, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ..permissions import IsAdminUserFlag
from ..serializers.UserProfileSerializer import UserProfileSerializer

CustomUser = get_user_model()

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