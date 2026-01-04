# notifications/models.py
from django.db import models
from django.contrib.auth.models import User

# 1. Secure Contact Information (Admin-Only View)
class ContactInfo(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='contact_info')
    
    # Store contacts securely—ONLY Administrators should be able to view these in the Admin Panel
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    whatsapp_id = models.CharField(max_length=50, blank=True, null=True) 
    # Email is already on the User model, but added here for consistency if needed
    
    def __str__(self):
        return f"Contacts for {self.user.username}"

# 2. Notification Log (for auditing)
class NotificationLog(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_notifications')
    recipient_count = models.IntegerField()
    channel = models.CharField(max_length=10, choices=[('SMS', 'SMS'), ('WA', 'WhatsApp'), ('EMAIL', 'Email')])
    message_content = models.TextField()
    sent_at = models.DateTimeField(auto_now_add=True)