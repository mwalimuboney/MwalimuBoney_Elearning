
# users/models.py
from django.db import models
from django.contrib.auth.models import User
from school.models import School, Class

# Define the user roles as choices for clean data storage
from django.db import models
from django.contrib.auth.models import User
from school.models import School, Class

# Import Department from your school models (adjust the import path if necessary)
# from school.models import Department 

# Updated Roles to include specific Administrative tiers
ROLE_CHOICES = [
    ('STUDENT', 'Student'), 
    ('TEACHER', 'Teacher'), 
    ('PARENT', 'Parent'),
    ('SUPER_ADMIN', 'Super Admin'),   # Global access
    ('SCHOOL_ADMIN', 'School Admin'), # Institutional access
    ('DEPT_ADMIN', 'Dept Admin'),     # Departmental access
    ('ADMINISTRATOR', 'Administrator'), # General admin (kept for compatibility)
]

class UserProfile(models.Model):
    """
    Extends the built-in User model with role and social/profile fields.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone_number = models.CharField(max_length=20, unique=True, blank=True, null=True)
    
    assessment_number = models.CharField(
        max_length=20, 
        unique=True, 
        null=True, 
        blank=True,
        help_text="Unique ID generated upon first exam registration."
    )
    
    is_whitelisted = models.BooleanField(
        default=True,
        help_text="If False, the assessment number is blocked from starting exams."
    )
    
    passport_photo = models.ImageField(
        upload_to='user_passport_photos/', 
        null=True, 
        blank=True,
        help_text="High-resolution photo for identity verification."
    )

    facial_template = models.BinaryField(
        null=True, 
        blank=True,
        help_text="Secured biometric template for facial recognition."
    )

    # Tenancy Links
    school = models.ForeignKey(School, on_delete=models.SET_NULL, null=True, blank=True, related_name='users_in_school')
    
    # NEW: Department Link (Added to support DEPT_ADMIN role)
    department = models.ForeignKey(
        'school.Department', # Assuming Department is in school.models
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='dept_users'
    )
    
    current_class = models.ForeignKey(Class, on_delete=models.SET_NULL, null=True, blank=True, related_name='class_students')
    xp = models.IntegerField(default=0) 
    level = models.IntegerField(default=1)
    
    # Core Role Field (Updated with new ROLE_CHOICES)
    role = models.CharField(
        max_length=20, 
        choices=ROLE_CHOICES, 
        default='STUDENT', 
        verbose_name='Account Role'
    )
    
    parent = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='children')

    private_phone_number = models.CharField(max_length=20, unique=True, blank=True, null=True)
    
    title = models.CharField(max_length=50, blank=True, verbose_name='Title (e.g., BSc Student)')
    bio = models.TextField(blank=True, verbose_name='User Biography')
    
    follows = models.ManyToManyField(
        'self', 
        symmetrical=False, 
        related_name='followers', 
        blank=True
    )

    def __str__(self):
        return f"{self.user.username} ({self.role}) - {self.school.name if self.school else 'No School'}"

class FRSettings(models.Model):
    # Reference the School model imported from school.models above
    school = models.OneToOneField(School, on_delete=models.CASCADE, primary_key=True)
    
    # 1. Login Verification
    enforce_teacher_login_fr = models.BooleanField(default=False)
    
    # 2. Exam Security
    enforce_exam_start_fr = models.BooleanField(default=True)
    
    # 3. Assessment Number Retrieval
    enforce_retrieval_fr = models.BooleanField(default=True)
    
    # 4. Sensitivity
    similarity_threshold = models.DecimalField(max_digits=3, decimal_places=2, default=0.85) # e.g., 85% match needed
