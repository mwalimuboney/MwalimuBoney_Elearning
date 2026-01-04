# FILE: communications/models.py (Revised Full App)

from django.db import models
from django.conf import settings # Best practice for referencing the User model
# Adjust imports based on your exact structure if needed
from school.models import School, Class 

# =========================================================================
# 1. ANNOUNCEMENT MODELS (Based on your provided structure)
# =========================================================================

class Announcement(models.Model):
    """
    Model for one-way broadcasting (Admin/Teacher to group or individual).
    """
    SCOPE_CHOICES = [
        ('GLOBAL_PUBLIC', 'All Schools/Public'),
        ('SCHOOL_INTERNAL', 'Internal School Only'),
        ('CLASS', 'Specific Class'),
        ('USER', 'Specific User')
    ]
    
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='sent_announcements'
    )
    scope_type = models.CharField(max_length=20, choices=SCOPE_CHOICES, default='SCHOOL_INTERNAL')
    
    # Targeting fields (may be null based on scope)
    target_school = models.ForeignKey(School, on_delete=models.CASCADE, null=True, blank=True)
    target_class = models.ForeignKey(Class, on_delete=models.CASCADE, null=True, blank=True)
    
    # NOTE: Using a separate ManyToMany model (e.g., AnnouncementReceipt) 
    # is often better for USER scope, but this simple FK is fine for basic targeting.
    target_user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        related_name='received_announcements'
    )
    
    title = models.CharField(max_length=255)
    content = models.TextField()
    is_notification = models.BooleanField(
        default=True,
        help_text="If checked, triggers an external notification (email/SMS/push)."
    ) 
    is_urgent = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"[{self.scope_type}] {self.title}"

    class Meta:
        ordering = ['-created_at']

# =========================================================================
# 2. PRIVATE MESSAGING MODELS (For teacher-student communication)
# =========================================================================

class Conversation(models.Model):
    """
    A container for a private chat between two or more users.
    """
    school = models.ForeignKey(School, on_delete=models.CASCADE)
    
    # Links the users participating (e.g., Teacher and Student)
    participants = models.ManyToManyField(
        settings.AUTH_USER_MODEL, 
        related_name='conversations'
    )
    
    # Simple display name 
    subject = models.CharField(max_length=255, blank=True)
    
    last_message_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Conv-{self.pk} ({self.subject or 'Private Chat'})"
    
    class Meta:
        ordering = ['-last_message_at']


class Message(models.Model):
    """
    An individual message within a conversation.
    """
    conversation = models.ForeignKey(
        Conversation, 
        on_delete=models.CASCADE, 
        related_name='messages'
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='sent_messages'
    )
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    
    attachment = models.FileField(
        upload_to='message_attachments/', 
        null=True, 
        blank=True
    )

    def __str__(self):
        return f"Msg-{self.pk} from {self.sender.username}"
    
    class Meta:
        ordering = ['timestamp']


class UnreadMessage(models.Model):
    """
    Tracks which users have not yet read a specific message (for efficient badge counts).
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='unread_messages'
    )
    message = models.ForeignKey(
        Message, 
        on_delete=models.CASCADE, 
        related_name='unread_recipients'
    )
    
    class Meta:
        unique_together = ('user', 'message')