# assessment/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from users.permissions import IsTeacherOrAdmin
from .models import Exam, Question, UserAttempt, AnswerSubmission, LearningProgress
from .serializers import ExamSerializer, LearningProgressSerializer, QuestionSerializer
from django.utils import timezone
from django.shortcuts import get_object_or_404
from datetime import timedelta
import json

class ExamManagerViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Teachers/Admins to Create, Read, Update, Delete (CRUD) exams and questions.
    """
    queryset = Exam.objects.all()
    serializer_class = ExamSerializer
    
    # Only Teachers and Admins can manage exams
    permission_classes = [IsTeacherOrAdmin] 

    @action(detail=True, methods=['get'])
    def questions(self, request, pk=None):
        """Allows fetching questions for a specific exam (Admin/Teacher only)."""
        exam = self.get_object()
        serializer = QuestionSerializer(exam.questions.all(), many=True)
        return Response(serializer.data)

class StudentAssessmentView(viewsets.GenericViewSet):
    """
    Handles student actions: starting, viewing, and submitting assessments.
    """
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        """Start an exam, creating a new UserAttempt."""
        exam = get_object_or_404(Exam, pk=pk)
        user = request.user
        
        # Check if attempt is valid (e.g., within start time window, not already taken if realtime)
        if exam.is_realtime and UserAttempt.objects.filter(user=user, exam=exam).exists():
            return Response({'detail': 'You have already completed this real-time exam.'}, 
                            status=status.HTTP_400_BAD_REQUEST)

        attempt = UserAttempt.objects.create(user=user, exam=exam, start_time=timezone.now())
        
        # Send questions (without correct answers)
        questions_serializer = QuestionSerializer(exam.questions.all(), many=True)
        
        return Response({
            'attempt_id': attempt.id,
            'exam_duration': exam.duration_minutes,
            'questions': questions_serializer.data,
        })

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        """Submit all answers for an attempt and calculate the score."""
        attempt = get_object_or_404(UserAttempt, pk=pk, user=request.user, is_completed=False)
        submission_data = request.data.get('submissions', [])
        
        if attempt.end_time and attempt.end_time < timezone.now():
             return Response({'detail': 'Submission failed: Time limit exceeded.'}, 
                            status=status.HTTP_400_BAD_REQUEST)

        total_score = 0
        
        for sub in submission_data:
            question = get_object_or_404(Question, pk=sub.get('question_id'))
            user_answer = sub.get('user_answer', '').strip()
            
            # Simple scoring logic: compare user_answer to correct_answer
            is_correct = (user_answer == question.correct_answer.strip())
            
            AnswerSubmission.objects.create(
                user_attempt=attempt,
                question=question,
                user_answer=user_answer,
                is_correct=is_correct
            )
            
            if is_correct:
                total_score += question.points

        # Finalize attempt
        attempt.score = total_score
        attempt.is_completed = True
        attempt.end_time = timezone.now()
        attempt.save()
        
        # NOTE: This is where you would trigger the update to LearningProgress
        
        return Response({
            'status': 'Submission complete.',
            'score': total_score,
            'detail': 'Score is available on your dashboard.'
        })

class LearningProgressReadOnlyViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API for Teachers/Admins to analyze learning progress, and students to see their own.
    """
    queryset = LearningProgress.objects.all()
    serializer_class = LearningProgressSerializer
    
    def get_queryset(self):
        """Filter data based on user role."""
        user = self.request.user
        if user.profile.role in ['TEACHER', 'ADMINISTRATOR']:
            # Admins/Teachers see all progress
            return LearningProgress.objects.all()
        
        # Students only see their own progress
        return LearningProgress.objects.filter(user=user)