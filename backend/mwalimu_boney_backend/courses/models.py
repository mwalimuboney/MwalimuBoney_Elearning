# courses/models.py
from django.db import models
from django.contrib.auth.models import User

class Course(models.Model):
    """Represents a full educational course."""
    title = models.CharField(max_length=200)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Lesson(models.Model):
    """Represents a single module or lecture within a course."""
    course = models.ForeignKey(Course, related_name='lessons', on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    content = models.TextField()
    order = models.IntegerField(default=0) # To define the sequence of lessons

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.course.title} - Lesson {self.order}: {self.title}"

class Quiz(models.Model):
    """Represents a quiz associated with a lesson."""
    lesson = models.OneToOneField(Lesson, related_name='quiz', on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    
    # You would typically have a Question model related to Quiz, 
    # but we keep it simple for now.

    def __str__(self):
        return f"Quiz for: {self.lesson.title}"


# Define file types for clean data
RESOURCE_TYPE_CHOICES = [
    ('PDF', 'PDF Document'),
    ('DOCX', 'Word Document'),
    ('PPT', 'PowerPoint Presentation'),
    ('VIDEO', 'Video File'),
    ('AUDIO', 'Audio File'),
    ('NOTES', 'Text/HTML Notes'),
]

class Resource(models.Model):
    """Stores files and content uploaded by Teachers/Admins."""
    uploader = models.ForeignKey(User, on_delete=models.CASCADE, related_name='uploaded_resources')
    course = models.ForeignKey('Course', on_delete=models.CASCADE, related_name='resources', null=True, blank=True)
    title = models.CharField(max_length=200)
    
    # Stores the actual file. Files will be saved in the 'media' folder.
    file = models.FileField(upload_to='resources/%Y/%m/', null=True, blank=True) 
    
    resource_type = models.CharField(max_length=10, choices=RESOURCE_TYPE_CHOICES)
    
    uploaded_at = models.DateTimeField(auto_now_add=True)
    views = models.PositiveIntegerField(default=0) # Tracks how many times the resource was viewed
    
    # Feature: Allows Teacher/Admin to specify students who can upload a resource
    # Note: This is a deviation from the main teacher flow, likely for submissions.
    allowed_students_to_upload = models.ManyToManyField(
        User, 
        related_name='allowed_uploads', 
        blank=True
    )

    def __str__(self):
        return f'{self.title} ({self.resource_type})'

# NOTE: You must also configure MEDIA_ROOT and MEDIA_URL in settings.py 
# to handle file uploads correctly. (See section 3)