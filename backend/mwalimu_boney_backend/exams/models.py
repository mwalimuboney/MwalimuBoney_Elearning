# FILE: exams/models.py

from django.db import models
from django.conf import settings # Use settings.AUTH_USER_MODEL for User
from school.models import School # Assuming School model is in schools/models.py

class Exam(models.Model):
    """Defines the core details and security configuration for an examination."""
    
    # Core Identification
    school = models.ForeignKey(School, on_delete=models.CASCADE, default='Ndakaru')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    
    # Timing and Status
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    duration_minutes = models.PositiveIntegerField(default=60)
    is_active = models.BooleanField(default=False)
    
    # Security Configuration (Per-Exam Overrides)
    enforce_face_scan = models.BooleanField(
        default=True,
        help_text="Requires a facial scan before starting the exam."
    )
    enforce_location_check = models.BooleanField(
        default=True,
        help_text="Requires geolocation verification before and during the exam."
    )
    max_allowed_violations = models.PositiveIntegerField(
        default=3,
        help_text="Maximum allowed security violations before automatic submission."
    )
    
    # Registration Link
    requires_registration = models.BooleanField(
        default=True,
        help_text="Must students register and be shortlisted before taking this exam?"
    )

    def __str__(self):
        return f"{self.title} ({self.school.name})"


# (Continuation)

REGISTRATION_STATUS_CHOICES = (
    ('REGISTERED', 'Registered'),
    ('SHORTLISTED', 'Shortlisted'), # Approved to take the exam
    ('REJECTED', 'Rejected'),       # Denied access (e.g., failed prerequisite, no payment)
)

class ExamRegistration(models.Model):
    """
    Tracks student registration for a specific exam and their shortlisting status.
    This is checked by the ExamStartView.
    """
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        limit_choices_to={'profile__role': 'STUDENT'}, # Only students can register
        related_name='exam_registrations'
    )
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='registrations')
    
    status = models.CharField(
        max_length=20, 
        choices=REGISTRATION_STATUS_CHOICES,
        default='REGISTERED'
    )
    
    shortlist_reason = models.TextField(
        blank=True, 
        help_text="Reason for REJECTED status (e.g., 'Fees not paid')."
    )
    
    registered_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'exam')
        verbose_name_plural = "Exam Registrations"

    def __str__(self):
        return f"{self.student.username} - {self.exam.title} ({self.status})"



ATTEMPT_STATUS_CHOICES = (
    ('IN_PROGRESS', 'In Progress'),
    ('SUBMITTED', 'Submitted'),
    ('DISQUALIFIED', 'Disqualified'), # Due to excessive violations
)

class ExamAttempt(models.Model):
    """Records a single attempt by a student on an exam."""
    
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='exam_attempts'
    )
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE)
    
    # Tracking
    status = models.CharField(max_length=20, choices=ATTEMPT_STATUS_CHOICES, default='IN_PROGRESS')
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    
    # Result
    score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    is_passed = models.BooleanField(default=False)
    
    # Security Tracking
    total_violations = models.PositiveIntegerField(default=0)
    
    class Meta:
        # Prevents multiple concurrent attempts, but allows a student to register multiple times 
        # if the exam is configured to allow it (e.g., practice quizzes)
        ordering = ['-start_time']
        
    def __str__(self):
        return f"{self.student.username}'s attempt on {self.exam.title}"
    


VIOLATION_TYPE_CHOICES = (
    ('FACE_MISMATCH', 'Facial Recognition Mismatch'),
    ('LOCATION_DRIFT', 'Location Drift/Change'),
    ('BROWSER_TAB_CHANGE', 'Browser Tab/Focus Change'),
    ('THIRD_PARTY_ACCESS', 'Unauthorized Third Party Access'),
)

class SecurityViolation(models.Model):
    """Logs details of a security violation during an exam attempt."""
    
    attempt = models.ForeignKey(ExamAttempt, on_delete=models.CASCADE, related_name='violations')
    
    violation_type = models.CharField(max_length=50, choices=VIOLATION_TYPE_CHOICES)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    # Contextual data
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    
    # Stores image captured during the facial mismatch/proctoring violation
    proctoring_photo = models.ImageField(upload_to='proctoring_evidence/', null=True, blank=True)
    
    is_reviewed = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.violation_type} at {self.timestamp.strftime('%Y-%m-%d %H:%M')}"