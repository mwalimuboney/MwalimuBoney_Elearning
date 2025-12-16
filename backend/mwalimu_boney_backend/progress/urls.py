# FILE: progress/urls.py

from django.urls import path
from .views import (
    CourseProgressListView,
    LessonCompletionToggleView,
    OverallProgressSummaryView,
    TeacherCourseProgressList,
    QuizAttemptCreateView,
    ProgressMetricListView,
)

urlpatterns = [
    # --- Student Self-Service Views ---
    
    # GET: List all courses the student is enrolled in with progress details
    path('my-courses/', 
         CourseProgressListView.as_view(), 
         name='student_course_progress_list'),
         
    # POST: Mark a specific lesson as completed/viewed
    path('lessons/toggle/<int:lesson_id>/', 
         LessonCompletionToggleView.as_view(), 
         name='lesson_completion_toggle'),
         
    # GET: High-level KPIs and summary data for the student dashboard
    path('summary/', 
         OverallProgressSummaryView.as_view(), 
         name='student_overall_summary'),

    # POST: Endpoint for the Quizzes app to submit and record a quiz score
    path('quiz-attempts/create/',
         QuizAttemptCreateView.as_view(),
         name='quiz_attempt_create'),
         
    # --- Teacher/Admin Analytics Views ---
    
    # GET: List progress of ALL students in a specific course (Teacher view)
    path('teacher/course/<int:course_id>/students/', 
         TeacherCourseProgressList.as_view(), 
         name='teacher_course_progress_list'),
         
    # GET: Trend data for charting (Course or Student specific)
    # Examples: /progress/metrics/?course_id=5 or /progress/metrics/?student_id=10
    path('metrics/', 
         ProgressMetricListView.as_view(), 
         name='progress_metrics_list'),
]