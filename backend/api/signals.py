from django.db.models.signals import post_save, post_migrate
from django.dispatch import receiver
from django.db.utils import ProgrammingError, OperationalError

from .models.user import CustomUser
from .models.profile import Profile
from .models.tag import Tag
from .models.security import SecurityQuestion


# ? Create or update Profile automatically when user is created/saved
@receiver(post_save, sender=CustomUser)

def create_or_update_user_profile(sender, instance, created, **kwargs):
    """Automatically create or update profile when user is saved."""
    try:
        if created:

            Profile.objects.get_or_create(user=instance)
        else:
            if hasattr(instance, 'profile'):
                instance.profile.save()
    except (ProgrammingError, OperationalError):

        pass

# ? Create default tags after migrations
@receiver(post_migrate)
def create_default_tags(sender, **kwargs):
    default_tags = [
        "python", "java", "javascript", "typescript", "csharp", "golang", "ruby", "php",
        "react", "vue", "angular", "tailwindcss", "bootstrap", "html", "css",
        "django", "flask", "spring", "express", "nestjs", "fastapi", "dotnet",
        "aws", "azure", "gcp", "docker", "kubernetes", "devops", "ci/cd", "terraform",
        "machine learning", "deep learning", "nlp", "data science", "pandas", "numpy", "tensorflow", "pytorch",
        "database", "mysql", "postgresql", "mongodb", "redis", "sqlite",
        "android", "ios", "flutter", "react native",
        "web development", "mobile development", "full stack", "backend", "frontend",
        "agile", "scrum", "kanban", "project management", "software engineering",
        "design patterns", "clean code", "refactoring", "testing", "unit testing", "integration testing",
        "performance optimization", "scalability", "security", "authentication", "authorization",
        "git", "github", "vscode", "testing", "rest api", "graphql", "microservices", "security",
        "blockchain", "cryptocurrency", "web3", "smart contracts", "solidity",
        "ui/ux", "user experience", "user interface", "accessibility", "design thinking",
        "career development", "job search", "resume writing", "interview preparation", "networking",
        "open source", "community", "mentorship", "contribution", "collaboration",
        "life lessons", "productivity", "motivation", "inspiration", "personal growth",
        "career", "interview", "other"
    ]

    try:
        for tag_name in default_tags:
            Tag.objects.get_or_create(name=tag_name)
    except (ProgrammingError, OperationalError):

        pass


# ? Create default security questions safely
@receiver(post_migrate)
def create_default_security_questions(sender, **kwargs):
    default_questions = [
        "What is your favourite colour?",
        "What is your favourite animal?",
        "What is your favourite food?",
    ]

    try:
        for q_text in default_questions:
            SecurityQuestion.objects.get_or_create(question_text=q_text)
    except (ProgrammingError, OperationalError):
        pass
