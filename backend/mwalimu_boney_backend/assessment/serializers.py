# assessment/serializers.py
from rest_framework import serializers
from .models import Exam, Question, UserAttempt, AnswerSubmission, LearningProgress, ManualGrade
from users.serializers import UserProfileSerializer # To display profile/role data

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'text', 'question_type', 'options', 'points']
        # Hide correct answer from students unless they are admins/teachers
        read_only_fields = ['correct_answer'] 

class ExamSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Exam
        fields = '__all__'
        
class UserAttemptSerializer(serializers.ModelSerializer):
    exam_title = serializers.CharField(source='exam.title', read_only=True)
    
    class Meta:
        model = UserAttempt
        fields = ['id', 'exam', 'exam_title', 'start_time', 'end_time', 'score', 'is_completed']

class LearningProgressSerializer(serializers.ModelSerializer):
    user_profile = UserProfileSerializer(source='user.profile', read_only=True)
    
    class Meta:
        model = LearningProgress
        fields = ['user', 'user_profile', 'total_resources_read', 'total_assessments_taken', 'average_assessment_score', 'last_updated']
        read_only_fields = fields

class AnswerSubmissionSerializer(serializers.ModelSerializer):
    question_text = serializers.CharField(source='question.text', read_only=True)
    
    class Meta:
        model = AnswerSubmission
        fields = ['id', 'user_attempt', 'question', 'question_text', 'user_answer', 'is_correct']   
        

class ManualGradeSerializer(serializers.ModelSerializer):
    student_username = serializers.CharField(source='student.username', read_only=True)
    
    class Meta:
        model = ManualGrade
        fields = '__all__'
        read_only_fields = ['teacher']
