# FILE: progress/serializers.py

from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    CourseProgress, 
    LessonCompletion, 
    QuizAttempt, 
    ProgressMetric, 
    # COURSE_STATUS_CHOICES
)
# Assuming these models exist in other apps:
from courses.models import Course, Lesson, Quiz

User = get_user_model()

# --- Helper Serializers ---

class CourseDetailSerializer(serializers.ModelSerializer):
    """Simple detail for linking Course FK."""
    class Meta:
        model = Course
        fields = ['id', 'title']

class LessonDetailSerializer(serializers.ModelSerializer):
    """Simple detail for linking Lesson FK."""
    class Meta:
        model = Lesson
        fields = ['id', 'title']
        
class QuizDetailSerializer(serializers.ModelSerializer):
    """Simple detail for linking Quiz FK."""
    class Meta:
        model = Quiz
        fields = ['id', 'title']

# =========================================================================
# 1. CORE PROGRESS TRACKING SERIALIZERS
# =========================================================================

class CourseProgressSerializer(serializers.ModelSerializer):
    """
    Serializer for listing a student's overall progress in a course.
    Used by both students (self-view) and teachers (list view).
    """
    course_detail = CourseDetailSerializer(source='course', read_only=True)
    student_username = serializers.CharField(source='student.username', read_only=True)
    
    class Meta:
        model = CourseProgress
        fields = [
            'id', 'student', 'student_username', 'course', 'course_detail', 
            'status', 'completion_percentage', 'enrollment_date', 
            'last_activity', 'completion_date', 'certificate_awarded'
        ]
        read_only_fields = ['student', 'enrollment_date', 'last_activity']

class LessonCompletionSerializer(serializers.ModelSerializer):
    """
    Serializer for recording and viewing lesson completion status.
    """
    lesson_detail = LessonDetailSerializer(source='lesson', read_only=True)
    
    class Meta:
        model = LessonCompletion
        fields = [
            'id', 'lesson', 'lesson_detail', 'is_completed', 
            'completion_date', 'time_spent_seconds'
        ]
        read_only_fields = ['student', 'course_progress']


class QuizAttemptSerializer(serializers.ModelSerializer):
    """
    Serializer for recording a student's quiz attempt result (used on creation/submission).
    """
    quiz_detail = QuizDetailSerializer(source='quiz', read_only=True)

    class Meta:
        model = QuizAttempt
        fields = [
            'id', 'student', 'quiz', 'quiz_detail', 'score', 'max_score', 
            'percentage_score', 'is_passed', 'attempt_start_time', 
            'attempt_end_time'
        ]
        read_only_fields = ['student', 'attempt_start_time']

    # Input validation example:
    def validate(self, data):
        """Ensure score is not greater than max_score and percentage is calculated."""
        if data['score'] > data['max_score']:
            raise serializers.ValidationError("Score cannot exceed the maximum score.")
        
        # Recalculate percentage score on input if not provided
        if not data.get('percentage_score') and data['max_score'] > 0:
            data['percentage_score'] = (data['score'] / data['max_score']) * 100
        
        return data

# =========================================================================
# 2. ANALYTICS & SUMMARY SERIALIZERS
# =========================================================================

class ProgressMetricSerializer(serializers.ModelSerializer):
    """
    Serializer for viewing aggregated trend data (Teacher/Admin).
    """
    class Meta:
        model = ProgressMetric
        fields = [
            'id', 'student', 'course', 'metric_type', 'value', 'calculated_on'
        ]


class OverallProgressSummarySerializer(serializers.Serializer):
    """
    Serializer used specifically for the overall KPI dashboard summary (no model).
    This defines the structure of the output JSON for the OverallProgressSummaryView.
    """
    total_courses_enrolled = serializers.IntegerField()
    courses_completed = serializers.IntegerField()
    average_quiz_score = serializers.DecimalField(max_digits=5, decimal_places=2)
    total_hours_spent = serializers.DecimalField(max_digits=10, decimal_places=2, help_text="Total time spent on lessons.")
    
    # Optional: Add fields for quick access to certificates
    # certificates_available = serializers.IntegerField(required=False)