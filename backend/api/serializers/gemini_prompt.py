from rest_framework import serializers

class BlogExpansionRequestSerializer(serializers.Serializer):
    wordcount = serializers.IntegerField(min_value=50, max_value=2000)
    prompt_suggestion = serializers.CharField(max_length=200, trim_whitespace=True)
