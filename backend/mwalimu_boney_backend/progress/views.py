

# FILE: progress/views.py

from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Avg, Sum, Count, F
from django.utils import timezone
from django.db import transaction
from courses.models import Course, Lesson # Needed for context
from gamification.services import XPService # Assuming the XP service exists
from courses.services import CourseService # Assuming a service to handle course progress logic
from .models import CourseProgress, LessonCompletion, QuizAttempt, ProgressMetric
from .serializers import (
    CourseProgressSerializer, 
    LessonCompletionSerializer, 
    QuizAttemptSerializer, 
    OverallProgressSummarySerializer,
    ProgressMetricSerializer
)

# --- 1. Course Progress List/Detail (Student's Dashboard) ---
class CourseProgressListView(generics.ListAPIView):
    """Lists all courses the student is enrolled in with their overall progress."""
    serializer_class = CourseProgressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return CourseProgress.objects.filter(
            student=self.request.user
        ).select_related('course')

# --- 2. Lesson Completion Detail/Toggle (Tracking Lesson Completion) ---
class LessonCompletionToggleView(APIView):
    """
    Toggles the completion status of a specific lesson for the current user 
    and triggers Gamification XP awards if the lesson was newly completed.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, lesson_id):
        user = request.user
        
        try:
            lesson = Lesson.objects.get(pk=lesson_id)
        except Lesson.DoesNotExist:
            return Response({"detail": "Lesson not found."}, status=status.HTTP_404_NOT_FOUND)

        # Use a transaction to ensure database updates and XP awards are atomic
        with transaction.atomic():
            
            # Ensure CourseProgress exists
            course_progress, _ = CourseProgress.objects.get_or_create(
                student=user,
                course=lesson.course,
                defaults={'status': 'ENROLLED'}
            )

            completion, created = LessonCompletion.objects.get_or_create(
                student=user,
                lesson=lesson,
                course_progress=course_progress
            )
            
            # Check if this lesson is *NEWLY* completed
            was_completed_before = completion.is_completed
            
            if not was_completed_before:
                # 1. Mark lesson as complete
                completion.is_completed = True
                completion.completion_date = timezone.now()
                completion.save()
                
                # 2. Recalculate and update CourseProgress (Service needed here)
                # Example: RecalculateCourseProgressService.recalculate(course_progress)
                course_progress.last_activity = timezone.now()
                course_progress.save()
                
                # --- Gamification Trigger ---
                try:
                    # Award XP for Lesson Completion
                    XPService.award_xp(
                        user=user, 
                        action_key='LESSON_COMPLETE', 
                        context_id=lesson.id
                    )
                    
                    # Check for Course Completion
                    if CourseService.is_course_complete(user, lesson.course.id):
                        XPService.award_xp(
                            user=user, 
                            action_key='COURSE_COMPLETE', 
                            context_id=lesson.course.id
                        )
                        # Mark the CourseProgress status as COMPLETED
                        course_progress.status = 'COMPLETED'
                        course_progress.completion_date = timezone.now()
                        course_progress.save()
                        
                except Exception as e:
                    # Log the failure but allow the core progress update to succeed
                    print(f"Gamification failed to award XP: {e}") 
                    # Consider logging this with Django's logging module instead of print
                    
                return Response({
                    "detail": f"Lesson '{lesson.title}' marked as completed. XP awarded.",
                    "is_completed": True
                }, status=status.HTTP_200_OK)
            
            # If the lesson was already completed
            return Response({
                "detail": f"Lesson '{lesson.title}' was already completed. No new XP awarded.",
                "is_completed": True
            }, status=status.HTTP_200_OK)

# --- 3. Overall Student Progress Summary ---
class OverallProgressSummaryView(APIView):
    """Provides key performance indicators (KPIs) for the student's dashboard."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        total_courses = CourseProgress.objects.filter(student=user).count()
        completed_courses = CourseProgress.objects.filter(student=user, status='COMPLETED').count()
        
        # Calculate average quiz score across all attempts
        avg_quiz_score = QuizAttempt.objects.filter(student=user).aggregate(Avg('percentage_score'))['percentage_score__avg'] or 0
        
        # Calculate total time spent (using LessonCompletion metric)
        total_time_spent = LessonCompletion.objects.filter(student=user).aggregate(Sum('time_spent_seconds'))['time_spent_seconds__sum'] or 0

        # Serialize results (using a simple dictionary or a dedicated serializer)
        data = {
            "total_courses_enrolled": total_courses,
            "courses_completed": completed_courses,
            "average_quiz_score": round(avg_quiz_score, 2),
            "total_hours_spent": round(total_time_spent / 3600, 2), # Convert seconds to hours
        }
        
        serializer = OverallProgressSummarySerializer(data=data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


# FILE: progress/views.py (Continuation)

# --- 4. Teacher: List All Students' Progress in a Course ---
class TeacherCourseProgressList(generics.ListAPIView):
    """
    Lists all students enrolled in a specific course along with their progress.
    (Teacher/Admin view)
    """
    serializer_class = CourseProgressSerializer
    permission_classes = [IsAuthenticated] # Needs IsTeacher permission

    def get_queryset(self):
        course_id = self.kwargs.get('course_id')
        user = self.request.user
        
        # Security: Ensure the teacher is authorized for this course/school
        # Assuming the Teacher is linked to the Course or School
        # Filter all progress records for the requested course
        return CourseProgress.objects.filter(
            course_id=course_id,
            course__school=user.profile.school # Security check
        ).select_related('student', 'course')


# --- 5. Quiz Attempt Detail/Create (Backend for Quiz Grading) ---
class QuizAttemptCreateView(generics.CreateAPIView):
    """
    Receives quiz submission data and saves the resulting score/attempt.
    (Used by the Quizzes app or a service to record results)
    """
    serializer_class = QuizAttemptSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # NOTE: The actual scoring logic should happen in a service or on the frontend/in validation, 
        # and the resulting score data passed here.
        
        # Ensure the student field is set correctly
        serializer.save(student=self.request.user)

# --- 6. Progress Metrics View (Teacher/Admin Trend Analysis) ---
class ProgressMetricListView(generics.ListAPIView):
    """
    Lists aggregated progress metrics (e.g., average quiz score trend) for a course or student.
    (Admin/Teacher view)
    """
    serializer_class = ProgressMetricSerializer
    permission_classes = [IsAuthenticated] # Needs IsTeacher or IsAdmin permission

    def get_queryset(self):
        course_id = self.kwargs.get('course_id')
        student_id = self.kwargs.get('student_id')
        
        qs = ProgressMetric.objects.all()

        if course_id:
            qs = qs.filter(course_id=course_id)
        if student_id:
            qs = qs.filter(student_id=student_id)

        # Order by calculation date for trend charting
        return qs.order_by('calculated_on')
    
