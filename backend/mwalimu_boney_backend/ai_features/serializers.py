# FILE: ai_features/serializers.py

from rest_framework import serializers
from school.models import FRSettings # Assuming FRSettings model is in schools/models.py

# --- 1. Serializer for AI Summarization Input ---
# Used by POST request to /api/ai/summarize/
class SummarizeInputSerializer(serializers.Serializer):
    """
    Handles the input text payload for the summarization endpoint.
    """
    text = serializers.CharField(
        style={'base_template': 'textarea.html'}, 
        help_text="The body of text to be summarized."
    )

# --- 2. Serializer for FR Settings ---
# Used by GET and PUT requests to /api/admin/fr-settings/
class FRSettingsSerializer(serializers.ModelSerializer):
    """
    Handles the settings model that controls Facial Recognition enforcement.
    """
    class Meta:
        model = FRSettings
        fields = [
            'enforce_teacher_login_fr',
            'enforce_exam_start_fr',
            'enforce_retrieval_fr', # Included for completeness if used in model
            'similarity_threshold'
        ]
        read_only_fields = ['school'] # School is determined by the logged-in user
        
    def validate_similarity_threshold(self, value):
        """Ensures the threshold is a reasonable value between 0.5 and 1.0."""
        if value < 0.5 or value > 1.0:
            raise serializers.ValidationError("Similarity threshold must be between 0.5 and 1.0.")
        return value


class FRTemplateEnrollmentSerializer(serializers.Serializer):
    """
    Serializer for handling facial template enrollment requests.
    """
    image = serializers.ImageField(
        help_text="Image file containing the user's face for template generation."
    )
    def validate_image(self, value):
        """Validates that the image contains a detectable face."""
        import face_recognition
        image = face_recognition.load_image_file(value)
        encodings = face_recognition.face_encodings(image)
        if not encodings:
            raise serializers.ValidationError("No face detected in the provided image.")
        return value
    
