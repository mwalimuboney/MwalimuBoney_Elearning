
# users/models.py
from django.db import models
from django.contrib.auth.models import User
from school.models import School, Class

# Define the user roles as choices for clean data storage
# 2. Roles (New: PARENT)
ROLE_CHOICES = [
        ('STUDENT', 'Student'), ('TEACHER', 'Teacher'), 
        ('ADMINISTRATOR', 'Administrator'), ('PARENT', 'Parent')
]


class UserProfile(models.Model):
    """
    Extends the built-in User model with role and social/profile fields.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone_number = models.CharField(max_length=20, unique=True, blank=True, null=True)
    # 1. Unique Assessment Number
    assessment_number = models.CharField(
        max_length=20, 
        unique=True, 
        null=True, 
        blank=True,
        help_text="Unique ID generated upon first exam registration."
    )
    
    # 2. Whitelisting/Blacklisting Status
    is_whitelisted = models.BooleanField(
        default=True,
        help_text="If False, the assessment number is blocked from starting exams."
    )
    
    # 3. Photo Storage (Used for retrieval verification)
    passport_photo = models.ImageField(
        upload_to='user_passport_photos/', 
        null=True, 
        blank=True,
        help_text="High-resolution photo for identity verification."
    )

    # Stores the primary biometric data (facial template/vector/descriptor)
    # This should be a secure hash or vector, NOT the raw image.
    facial_template = models.BinaryField(
        null=True, 
        blank=True,
        help_text="Secured biometric template for facial recognition."
    )
    # 1. Tenancy/Class Links
    school = models.ForeignKey(School, on_delete=models.SET_NULL, null=True, blank=True, related_name='users_in_school')
    current_class = models.ForeignKey(Class, on_delete=models.SET_NULL, null=True, blank=True, related_name='class_students')
    xp = models.IntegerField(default=0) # Experience Points
    level = models.IntegerField(default=1)
    
    # Core Role Field
    role = models.CharField(
        max_length=15, 
        choices=ROLE_CHOICES, 
        default='STUDENT', 
        verbose_name='Account Role'
    )
    
    # 3. Family Link
    parent = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='children')

    # 4. Private Contact Info (ADMIN-ONLY VIEW)
    # We move the private phone number here, enforcing uniqueness.
    private_phone_number = models.CharField(max_length=20, unique=True, blank=True, null=True)
    
    # Public Profile Fields
    title = models.CharField(max_length=50, blank=True, verbose_name='Title (e.g., BSc Student)')
    bio = models.TextField(blank=True, verbose_name='User Biography')
    
    # Social Feature: User Following
    # Stores users that *this* user is following.
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
