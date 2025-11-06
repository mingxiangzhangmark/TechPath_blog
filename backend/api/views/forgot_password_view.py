from rest_framework import generics, status
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from api.models.security import UserSecurityAnswer

User = get_user_model()

class ForgetPasswordStartView(generics.GenericAPIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        if not email:
            return Response({"error": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        user_answers = UserSecurityAnswer.objects.filter(user=user).select_related("question")
        questions = [
            {"id": ua.question.id, "question_text": ua.question.question_text}
            for ua in user_answers
        ]
        return Response({"questions": questions}, status=status.HTTP_200_OK)


class ForgetPasswordVerifyView(generics.GenericAPIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        answers = request.data.get("answers", [])

        if not email or not answers:
            return Response({"error": "Email and answers are required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        for ans in answers:
            qid = ans.get("question_id")
            text = ans.get("answer", "").strip().lower()
            try:
                user_answer = UserSecurityAnswer.objects.get(user=user, question_id=qid)
            except UserSecurityAnswer.DoesNotExist:
                return Response({"error": f"Invalid question id: {qid}"}, status=status.HTTP_400_BAD_REQUEST)
            if user_answer.answer.lower() != text:
                return Response({"error": "One or more answers are incorrect."}, status=status.HTTP_400_BAD_REQUEST)

        token = RefreshToken.for_user(user).access_token
        return Response({"message": "Security answers verified.", "reset_token": str(token)}, status=status.HTTP_200_OK)


class ForgetPasswordResetView(generics.GenericAPIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get("reset_token")
        new_password = request.data.get("new_password")
        confirm_password = request.data.get("confirm_password")

        if not token or not new_password or not confirm_password:
            return Response({"error": "All fields are required."}, status=status.HTTP_400_BAD_REQUEST)
        if new_password != confirm_password:
            return Response({"error": "Passwords do not match."}, status=status.HTTP_400_BAD_REQUEST)
        if len(new_password) < 8:
            return Response({"error": "Password must be at least 8 characters long."}, status=status.HTTP_400_BAD_REQUEST)

        from rest_framework_simplejwt.tokens import AccessToken
        try:
            access = AccessToken(token)
            user_id = access["user_id"]
            user = User.objects.get(id=user_id)
        except Exception:
            return Response({"error": "Invalid or expired reset token."}, status=status.HTTP_400_BAD_REQUEST)

        user.password = make_password(new_password)
        user.save()

        return Response({"message": "Password reset successful."}, status=status.HTTP_200_OK)
