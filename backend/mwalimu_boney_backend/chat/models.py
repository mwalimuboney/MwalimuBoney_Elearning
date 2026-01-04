# chat/models.py
from django.db import models
from django.contrib.auth import get_user_model
from django.contrib.auth.models import User
from courses.models import Course # Link chat to a specific course
User = get_user_model()
class ChatMessage(models.Model):
    """
    Stores individual messages in the global chat room.
    """
    # We'll use one global room for simplicity, but this can be dynamic
    room_name = models.CharField(max_length=255, default='global') 
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    
    # Moderation requirement
    is_abusive = models.BooleanField(default=False) 

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f'{self.user.username}: {self.content[:20]}'


class ChatRoom(models.Model):
    """Represents a discussion thread linked to a specific course."""
    course = models.ForeignKey(
        Course, 
        related_name='chatrooms', 
        on_delete=models.CASCADE
    )
    name = models.CharField(max_length=255, default='General Course Discussion')
    
    def __str__(self):
        return f"{self.course.title} - {self.name}"

class Message(models.Model):
    """Represents a single chat message."""
    room = models.ForeignKey(ChatRoom, related_name='messages', on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['timestamp']