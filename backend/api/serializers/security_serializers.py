from rest_framework import serializers
from django.contrib.auth import get_user_model
from api.models.security import SecurityQuestion, UserSecurityAnswer

User = get_user_model()


class SecurityQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = SecurityQuestion
        fields = ["id", "question_text"]


class VerifySecurityAnswersSerializer(serializers.Serializer):
    email = serializers.EmailField()
    answers = serializers.ListField(
        child=serializers.CharField(max_length=255),
        min_length=3,
        max_length=3
    )
    new_password = serializers.CharField(write_only=True, min_length=8)

    def validate(self, data):
        email = data.get("email")
        answers = data.get("answers")
        new_password = data.get("new_password")

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError({"email": "User not found."})

        stored_answers = UserSecurityAnswer.objects.filter(user=user).order_by("question__id")

        if len(stored_answers) != len(answers):
            raise serializers.ValidationError({"answers": "Invalid number of answers provided."})

        for given, stored in zip(answers, stored_answers):
            if given.strip().lower() != stored.answer.strip().lower():
                raise serializers.ValidationError({"answers": "Security answers do not match."})


        user.set_password(new_password)
        user.save()

        return data
