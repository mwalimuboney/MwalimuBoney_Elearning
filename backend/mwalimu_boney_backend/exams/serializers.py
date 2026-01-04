# FILE: exams/serializers.py

from rest_framework import serializers
from .models import (
    Exam, 
    ExamRegistration, 
    ExamAttempt, 
    SecurityViolation, 
    REGISTRATION_STATUS_CHOICES,
)
from users.models import UserProfile # To potentially display assessment_number status

class ExamSerializer(serializers.ModelSerializer):
    """Serializer for displaying Exam details for registration."""
    
    # Custom field to show if the student is already registered
    is_registered = serializers.SerializerMethodField()
    
    class Meta:
        model = Exam
        fields = [
            'id', 'title', 'description', 'duration_minutes', 
            'start_time', 'end_time', 'requires_registration', 
            'enforce_face_scan', 'is_registered'
        ]
        
    def get_is_registered(self, obj):
        """Checks if the currently authenticated user has an ExamRegistration record for this exam."""
        user = self.context['request'].user
        if not user.is_authenticated:
            return False
            
        return ExamRegistration.objects.filter(student=user, exam=obj).exists()
    

class ExamRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for managing student registration status and shortlisting.
    """
    exam_title = serializers.CharField(source='exam.title', read_only=True)
    student_username = serializers.CharField(source='student.username', read_only=True)
    
    # Admin can update status and reason
    status = serializers.ChoiceField(
        choices=REGISTRATION_STATUS_CHOICES,
        required=False
    )
    
    class Meta:
        model = ExamRegistration
        fields = [
            'id', 'exam', 'exam_title', 'student', 'student_username', 
            'status', 'shortlist_reason', 'registered_at'
        ]
        read_only_fields = ['student', 'exam', 'registered_at']

    def validate_status(self, value):
        """Ensure status transition is valid (e.g., cannot directly go from REJECTED to SHORTLISTED without admin override)."""
        # This is where you would put complex transition logic if needed.
        if value not in [c[0] for c in REGISTRATION_STATUS_CHOICES]:
            raise serializers.ValidationError("Invalid registration status.")
        return value



class ExamStartInputSerializer(serializers.Serializer):
    """
    Serializer for validating the required input before allowing an exam attempt.
    """
    assessment_number = serializers.CharField(
        max_length=20, 
        required=True,
        help_text="The unique assessment number assigned to the student."
    )
    
    # Additional input fields for security checks (if needed by frontend)
    # e.g., location_latitude = serializers.DecimalField(...)

    def validate_assessment_number(self, value):
        """
        Custom validation check on the format of the assessment number.
        """
        if not value.startswith('AS-'):
            raise serializers.ValidationError("Assessment number must start with 'AS-'.")
        
        # NOTE: The actual comparison of the number against the user's stored number 
        # is handled in the ExamStartView for better context access.
        
        return value



class SecurityViolationSerializer(serializers.ModelSerializer):
    """
    Serializer for creating and viewing security violation records.
    """
    class Meta:
        model = SecurityViolation
        fields = [
            'id', 'attempt', 'violation_type', 'timestamp', 
            'latitude', 'longitude', 'proctoring_photo', 'is_reviewed'
        ]
        read_only_fields = ['timestamp', 'is_reviewed']

