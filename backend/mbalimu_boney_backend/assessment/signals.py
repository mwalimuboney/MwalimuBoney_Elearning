# assessment/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
#from .models import UserAttempt, LearningProgress
from assessment.models import UserAttempt, LearningProgress

@receiver(post_save, sender=UserAttempt)
def update_learning_progress(sender, instance, created, **kwargs):
    """Updates the user's aggregated progress metrics upon successful attempt completion."""
    if instance.is_completed:
        user = instance.user
        progress, _ = LearningProgress.objects.get_or_create(user=user)
        
        # Calculate updated metrics
        completed_attempts = UserAttempt.objects.filter(user=user, is_completed=True)
        total_score = sum(a.score for a in completed_attempts)
        count = completed_attempts.count()

        progress.total_assessments_taken = count
        
        if count > 0:
            # Calculate average score
            progress.average_assessment_score = total_score / count
        
        # Note: total_resources_read needs a signal from the ResourceView model
        
        progress.save()