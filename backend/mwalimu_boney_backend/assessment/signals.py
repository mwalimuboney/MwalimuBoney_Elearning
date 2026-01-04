# assessment/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from notifications.services import CommunicationService # Assuming you create this service
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




@receiver(post_save, sender=UserAttempt)
def handle_assessment_notifications(sender, instance, created, **kwargs):
    # Determine the associated teacher (Requires linking Exam to Instructor)
    # ASSUMPTION: The Course model has an 'instructor' FK to User
    teacher = instance.exam.course.instructor
    student = instance.user

    if created:
        # Student just STARTED the exam (UserAttempt created)
        subject = f"ACTION REQUIRED: {student.username} started {instance.exam.title}"
        content = f"Student {student.username} has just begun the exam '{instance.exam.title}'. Start time: {instance.start_time.strftime('%H:%M')}."
        # Trigger communication service to notify the teacher
        CommunicationService.notify(teacher, subject, content, channels=['WA', 'EMAIL'])

    elif not created and instance.is_completed and instance.score is not None:
        # Student just FINISHED the exam (UserAttempt updated and completed)
        subject = f"ASSESSMENT COMPLETE: {student.username} finished {instance.exam.title}"
        content = f"Student {student.username} completed '{instance.exam.title}'. Score: {instance.score} points."
        CommunicationService.notify(teacher, subject, content, channels=['WA', 'EMAIL'])