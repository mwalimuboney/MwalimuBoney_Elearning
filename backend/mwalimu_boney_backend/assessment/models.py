# assessment/models.py
from django.db import models
from django.contrib.auth.models import User
from courses.models import Course, Resource # Link assessments to courses
from django.core.exceptions import ValidationError
from school.models import School

QUESTION_TYPES = [
    ('MCQ', 'Multiple Choice Question'),
    ('TEXT', 'Short Answer Text'),
]

class Exam(models.Model):
    """Defines the structure, rules, and timing for an assessment."""
    title = models.CharField(max_length=255)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='exams')
    
    # Teacher/Admin settings
    start_time = models.DateTimeField()
    duration_minutes = models.IntegerField(default=60, help_text="Duration of the exam in minutes.")
    # Schools
    # Make nullable to avoid interactive default prompt when adding this field
    school = models.ForeignKey(
        School,
        on_delete=models.CASCADE,
        related_name='school_exams',
        null=True,
        blank=True,
    )
    is_inter_school = models.BooleanField(default=False) # New flag for public exams
    is_public = models.BooleanField(default=False) # New flag for school-wide announcements

    # Rules
    is_realtime = models.BooleanField(default=True, help_text="If false, it's a practice test.")
    show_score_immediately = models.BooleanField(default=False)
    
    def __str__(self):
        return f'{self.title} for {self.course.title}'

class Question(models.Model):
    """Stores individual questions for an exam."""
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='questions')
    text = models.TextField()
    question_type = models.CharField(max_length=10, choices=QUESTION_TYPES, default='MCQ')
    
    # MCQ specific fields
    options = models.JSONField(null=True, blank=True, help_text="JSON list of options for MCQs.")
    
    # Correct Answer
    correct_answer = models.TextField(help_text="The correct answer (e.g., 'A' for MCQ, or text for TEXT type).")
    points = models.IntegerField(default=1)

    def __str__(self):
        return f'Q{self.id}: {self.text[:50]}...'
# assessment/models.py

# ... (imports and other models remain the same) ...

class UserAttempt(models.Model):
    """Tracks a user's single attempt at an exam."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='attempts')
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='attempts')
    
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    
    # Final score data
    score = models.IntegerField(default=0)
    is_completed = models.BooleanField(default=False)
    
    # --- FIX 1: Add a local field to store the exam's realtime status ---
    # We populate this field programmatically before saving to the database.
    is_practice_mode = models.BooleanField(default=False) 

    # --- FIX 2: Implement validation logic more robustly ---
    # The clean method and save method are kept as application-level checks, 
    # but the database constraint is modified to use the local field.

    def save(self, *args, **kwargs):
        # Ensure the local field matches the related exam's status before saving/validating
        if self.exam_id is not None:
            # We must fetch the exam object if it's not already loaded to get the real-time status
            if not hasattr(self, '_cached_exam_is_realtime'):
                 # Avoid database hits if possible, but load if necessary
                 self.is_practice_mode = not self.exam.is_realtime
            
        # Note: Calling full_clean() in save() works well with forms 
        # but can cause issues with bulk operations or signals. 
        # It's better practice to let the database handle integrity if possible.
        super().save(*args, **kwargs)

    class Meta:
        # Prevents a user from starting a practice exam (is_practice_mode=True) more than once
        constraints = [
            # --- FIX 3: Use the local field 'is_practice_mode' in the condition ---
            models.UniqueConstraint(
                fields=['user', 'exam'], 
                # Condition is now a database check on a local column
                condition=models.Q(is_practice_mode=True), 
                name='unique_practice_attempt' # Renamed for clarity
            )
        ]
        # To strictly prevent duplicate entries if somehow the save() method logic is bypassed 
        # (e.g., via bulk_create), the database constraint provides the final safety net.

    def __str__(self):
        return f'{self.user.username} - {self.exam.title} ({self.score} points)'

# ... (AnswerSubmission, ResourceView, LearningProgress models remain the same) ...

class AnswerSubmission(models.Model):
    """Stores the user's specific answer for one question in an attempt."""
    user_attempt = models.ForeignKey(UserAttempt, on_delete=models.CASCADE, related_name='submissions')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    user_answer = models.TextField(blank=True, null=True)
    is_correct = models.BooleanField(default=False)
    
    def __str__(self):
        return f'{self.user_attempt.user.username} - Q{self.question.id}'
    


class ResourceView(models.Model):
    """Tracks when a user views a resource (required for tracking learning)."""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    resource = models.ForeignKey('courses.Resource', on_delete=models.CASCADE) # FK to the Resource model
    viewed_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f'{self.user.username} viewed {self.resource.title[:20]}'

class LearningProgress(models.Model):
    """Aggregated dashboard metrics for user progress analysis."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='learning_progress')
    
    # Analysis metrics (updated via signals/cron jobs)
    total_resources_read = models.PositiveIntegerField(default=0)
    total_assessments_taken = models.PositiveIntegerField(default=0)
    average_assessment_score = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    
    # Optional: Last time the progress was updated
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'Progress for {self.user.username}'
    
# (Conceptual)
class ManualGrade(models.Model):
    teacher = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assessment_manual_grades_given')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assessment_manual_grades')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='assessment_manual_grades')
    assignment_name = models.CharField(max_length=100)
    score = models.IntegerField()
    max_score = models.IntegerField(default=100)
    # Optional: 
    editable_by_teacher = models.BooleanField(default=True)
    recorded_at = models.DateTimeField(auto_now_add=True)
   
    class Meta:
        unique_together = ('student', 'course', 'assignment_name') # Ensure one grade per student/assignment
        
    def __str__(self):
        return f'{self.assignment_name} - {self.student.username}: {self.score}/{self.max_score}'
    
