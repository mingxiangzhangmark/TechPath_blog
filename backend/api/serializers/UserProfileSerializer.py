from rest_framework import serializers

from ..models.profile import Profile
from ..models.user import CustomUser


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['avatar', 'bio', 'linkedin', 'github', 'facebook', 'x_twitter', 'website']

class UserProfileSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer()

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'first_name', 'last_name',
                  'address', 'phone_number', 'is_admin_user', 'profile']
        read_only_fields = ['id', 'email', 'username', 'is_admin_user']

    def update(self, instance, validated_data):
        # Update user table fields
        profile_data = validated_data.pop('profile', {})
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update Profile table fields
        profile = instance.profile
        for attr, value in profile_data.items():
            setattr(profile, attr, value)
        profile.save()

        return instance