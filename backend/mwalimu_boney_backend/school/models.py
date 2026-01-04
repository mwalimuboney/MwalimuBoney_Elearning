# schools/models.py (New App)
from django.db import models
from django.contrib.auth.models import User
from django.contrib.gis.db import models as geomodels # Requires PostGIS setup


class School(models.Model):
    """The central organizational unit for multi-tenancy."""
    name = models.CharField(max_length=255, unique=True)
    admin_user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='schools_managed')
    is_public = models.BooleanField(default=False) # For inter-school visibility (e.g., interschool exams)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    official_lat = models.DecimalField(max_digits=9, decimal_places=6, null=True)
    official_lon = models.DecimalField(max_digits=9, decimal_places=6, null=True)
    # Define a safe radius in meters for the testing center
    geo_fence_radius_m = models.IntegerField(default=50) # 50 meters tolerance
    
    def __str__(self):
        return self.name

class Class(models.Model):
    """Represents a specific class (e.g., Grade 10A) within a school."""
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='classes')
    name = models.CharField(max_length=100)
    teacher = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='classes_taught') # The class teacher

    class Meta:
        # Prevents two classes in the same school from having the same name
        unique_together = ('school', 'name')
    
    def __str__(self):
        return f'{self.school.name} - {self.name}'
    


class SystemSound(models.Model):
    """Stores audio files for system alerts (e.g., Exam Start, Violation)."""
    # Scope: If school is null, it's a global default.
    school = models.ForeignKey('School', on_delete=models.CASCADE, null=True, blank=True) 
    
    # Defines the event this sound is for (e.g., 'SECURITY_VIOLATION', 'QUIZ_PASS', 'CHAT_MESSAGE')
    event_key = models.CharField(max_length=50, unique=True) 
    
    # The actual audio file (e.g., .mp3, .ogg). Stored via S3/Cloud Storage.
    audio_file = models.FileField(upload_to='system_sounds/') 

    # Example: Sound for security alerts
    @classmethod
    def get_alert_sound(cls, school_id=None):
        """Retrieves the custom sound for a security violation."""
        try:
            # Try to get the school-specific sound first
            return cls.objects.get(school_id=school_id, event_key='SECURITY_VIOLATION').audio_file.url
        except cls.DoesNotExist:
            # Fallback to the global default
            return cls.objects.get(school__isnull=True, event_key='SECURITY_VIOLATION').audio_file.url
    

class FRSettings(models.Model):
    """Facial Recognition enforcement settings for a School (admin-controlled)."""
    school = models.OneToOneField(School, on_delete=models.CASCADE, related_name='fr_settings')

    enforce_teacher_login_fr = models.BooleanField(default=False)
    enforce_exam_start_fr = models.BooleanField(default=False)
    enforce_retrieval_fr = models.BooleanField(default=False)

    # Similarity threshold value between 0.5 and 1.0
    similarity_threshold = models.FloatField(default=0.8, help_text='Value between 0.5 and 1.0')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'FR Settings'
        verbose_name_plural = 'FR Settings'

    def __str__(self):
        return f'FR Settings for {self.school.name}'


class Department(models.Model):
    school = models.ForeignKey(School, on_current_link=models.CASCADE, related_name='departments')
    name = models.CharField(max_length=255)
    head_of_department = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.school.name}"
#Every secure API ( CourseViewSet, ExamViewset, ExamManagerViewSet, ManualGardeViewset) MUST implement this logic to prevent cross-school data leakage.
# Django ViewSet Example (Applies to ALL data-fetching ViewSets)

# class CourseViewSet(viewsets.ModelViewSet):
#     # ... permissions and serializer ...
    
#     def get_queryset(self):
#         user = self.request.user
        
#         if not user.is_authenticated:
#             return Course.objects.none()
            
#         profile = user.profile
        
#         # 1. School Admin: See all data within their school
#         if profile.role == 'ADMINISTRATOR' and profile.school_id:
#             return Course.objects.filter(school=profile.school)
        
#         # 2. Teacher: See all data within their school
#         if profile.role == 'TEACHER' and profile.school_id:
#             return Course.objects.filter(school=profile.school)
        
#         # 3. Student/Parent: See only published courses relevant to their school
#         if profile.role in ['STUDENT', 'PARENT'] and profile.school_id:
#             return Course.objects.filter(school=profile.school, is_published=True)
            
#         return Course.objects.none()