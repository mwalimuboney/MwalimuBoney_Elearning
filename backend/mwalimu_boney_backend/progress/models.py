# FILE: progress/models.py

from django.db import models
from django.conf import settings
# Assuming 'courses' app exists and has Course model
from courses.models import Course 
# Assuming 'exams' app exists and has Exam model
from exams.models import Exam 
# Assuming 'schools' app exists and has School model
from school.models import School 

COURSE_STATUS_CHOICES = (
    ('ENROLLED', 'Enrolled'),
    ('IN_PROGRESS', 'In Progress'),
    ('COMPLETED', 'Completed'),
    ('WITHDRAWN', 'Withdrawn'),
)

class CourseProgress(models.Model):
    """Tracks a student's overall status and progress within a course."""
    
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='course_progresses'
    )
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    
    # Core Progress Metrics
    status = models.CharField(max_length=20, choices=COURSE_STATUS_CHOICES, default='ENROLLED')
    completion_percentage = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        default=0.00,
        help_text="Calculated based on completed lessons/quizzes."
    )
    
    # Timing
    enrollment_date = models.DateTimeField(auto_now_add=True)
    last_activity = models.DateTimeField(auto_now=True)
    completion_date = models.DateTimeField(null=True, blank=True)
    
    # Certification
    certificate_awarded = models.BooleanField(default=False)
    
    class Meta:
        unique_together = ('student', 'course')
        verbose_name_plural = "Course Progresses"

    def __str__(self):
        return f"{self.student.username}'s progress in {self.course.title}"


# FILE: progress/models.py (Continuation)

# Assuming 'courses' app has a Lesson model
from courses.models import Lesson 

class LessonCompletion(models.Model):
    """Tracks the completion status of individual lessons."""
    
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='lesson_completions'
    )
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE)
    course_progress = models.ForeignKey(
        CourseProgress, 
        on_delete=models.CASCADE, 
        help_text="Link to the relevant course progress record."
    )
    
    is_completed = models.BooleanField(default=False)
    completion_date = models.DateTimeField(null=True, blank=True)
    
    # Optional: Time spent on lesson (for engagement metrics)
    time_spent_seconds = models.PositiveIntegerField(default=0)
    
    class Meta:
        unique_together = ('student', 'lesson')
        verbose_name_plural = "Lesson Completions"

    def __str__(self):
        return f"{self.student.username} completed {self.lesson.title}"


# FILE: progress/models.py (Continuation)

# Assuming 'quizzes' app has a Quiz model
from assessment.models import Question

class QuizAttempt(models.Model):
    """Records a single attempt by a student on a quiz."""
    
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='quiz_attempts'
    )
    quiz = models.ForeignKey(Question, on_delete=models.CASCADE)
    
    score = models.DecimalField(max_digits=5, decimal_places=2)
    max_score = models.DecimalField(max_digits=5, decimal_places=2)
    percentage_score = models.DecimalField(max_digits=5, decimal_places=2)
    
    is_passed = models.BooleanField(default=False)
    
    # Timing and Status
    attempt_start_time = models.DateTimeField(auto_now_add=True)
    attempt_end_time = models.DateTimeField()
    
    class Meta:
        ordering = ['-attempt_end_time']
        verbose_name_plural = "Quiz Attempts"

    def __str__(self):
        return f"{self.student.username}'s attempt on {self.quiz.title} ({self.score}/{self.max_score})"
    

# FILE: progress/models.py (Continuation)

METRIC_TYPE_CHOICES = (
    ('AVG_QUIZ_SCORE', 'Average Quiz Score'),
    ('TIME_SPENT_WEEK', 'Total Time Spent (Weekly)'),
    ('COURSE_PACE', 'Course Pace Factor'),
)

class ProgressMetric(models.Model):
    """Stores denormalized, aggregated performance metrics for analytics."""
    
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='progress_metrics'
    )
    course = models.ForeignKey(Course, on_delete=models.CASCADE, null=True, blank=True)
    
    metric_type = models.CharField(max_length=50, choices=METRIC_TYPE_CHOICES)
    
    # Value of the metric
    value = models.DecimalField(max_digits=10, decimal_places=2)
    
    # The date the metric was calculated for (useful for trend analysis)
    calculated_on = models.DateField()
    
    class Meta:
        ordering = ['-calculated_on']
        verbose_name_plural = "Progress Metrics"
        
    def __str__(self):
        return f"{self.student.username} - {self.metric_type} on {self.calculated_on}"



