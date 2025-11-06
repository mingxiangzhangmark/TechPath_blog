import re  # for regex validation
from django.contrib.auth import authenticate
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from rest_framework import serializers

from ..models.user import CustomUser
from ..models.security import SecurityQuestion, UserSecurityAnswer

class SignupSerializer(serializers.ModelSerializer):

    security_answers = serializers.ListField(
        child=serializers.CharField(max_length=255),
        min_length=3,
        max_length=3,
        write_only=True
    )

    class Meta:
        model = CustomUser
        fields = [
            'username', 'email', 'password',
            'first_name', 'last_name', 'address', 'phone_number',
            'is_admin_user', 'security_answers'
        ]
        extra_kwargs = {
            'password': {'write_only': True},
            'is_admin_user': {'default': False},
        }


    def validate_email(self, value):
        try:
            validate_email(value)
        except ValidationError:
            raise serializers.ValidationError("Enter a valid email address.")
        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value


    def validate_phone_number(self, value):
        if value and not re.match(r'^\+?\d{6,15}$', value):
            raise serializers.ValidationError(
                "Enter a valid phone number, It should be between 6 and 15 digits long."
            )
        return value


    def validate_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long.")
        if not re.search(r'[A-Za-z]', value):
            raise serializers.ValidationError("Password must contain at least one letter (a-z or A-Z).")
        if not re.search(r'\d', value):
            raise serializers.ValidationError("Password must contain at least one digit (0-9).")
        return value

    def create(self, validated_data):

        answers = validated_data.pop('security_answers', [])


        user = CustomUser.objects.create_user(**validated_data)


        questions = list(SecurityQuestion.objects.all().order_by('id')[:3])
        if len(questions) < 3:
            raise serializers.ValidationError("System security questions are not initialized properly.")


        for q, ans in zip(questions, answers):
            UserSecurityAnswer.objects.create(user=user, question=q, answer=ans.strip())

        return user
