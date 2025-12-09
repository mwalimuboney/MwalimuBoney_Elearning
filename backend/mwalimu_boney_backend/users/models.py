
# users/models.py
from django.db import models
from django.contrib.auth.models import User

# Define the user roles as choices for clean data storage
ROLE_CHOICES = [
    ('STUDENT', 'Student'),
    ('TEACHER', 'Teacher'),
    ('ADMINISTRATOR', 'Administrator'),
]

class UserProfile(models.Model):
    """
    Extends the built-in User model with role and social/profile fields.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    
    # Core Role Field
    role = models.CharField(
        max_length=15, 
        choices=ROLE_CHOICES, 
        default='STUDENT', 
        verbose_name='Account Role'
    )
    
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
        return f"{self.user.username} ({self.role})"