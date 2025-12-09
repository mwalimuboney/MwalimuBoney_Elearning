# chat/models.py
from django.db import models
from django.contrib.auth.models import User

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
