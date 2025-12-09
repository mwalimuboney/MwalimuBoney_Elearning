# courses/serializers.py
from rest_framework import serializers
from .models import Course, Lesson, Quiz, Resource

class QuizSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quiz
        fields = '__all__'

class LessonSerializer(serializers.ModelSerializer):
    quiz = QuizSerializer(read_only=True) # Nested serializer for the quiz
    
    class Meta:
        model = Lesson
        fields = ['id', 'title', 'content', 'order', 'quiz']

class CourseSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True) # Nested serializer for lessons
    
    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'created_at', 'lessons']

class ResourceSerializer(serializers.ModelSerializer):
    uploader_name = serializers.CharField(source='uploader.username', read_only=True)
    
    class Meta:
        model = Resource
        fields = [
            'id', 'title', 'file', 'resource_type', 
            'uploaded_at', 'views', 'uploader', 
            'uploader_name', 'course', 'allowed_students_to_upload'
        ]
        read_only_fields = ['uploader', 'uploaded_at', 'views']

