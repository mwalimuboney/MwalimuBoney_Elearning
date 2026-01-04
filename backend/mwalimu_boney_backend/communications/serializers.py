# FILE: communications/serializers.py

from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db.models import Max
from .models import (
    Announcement,
    Conversation,
    Message,
    UnreadMessage,
    Announcement,
    
)
# Assuming UserProfile is accessible for role/metadata
from users.models import UserProfile 

User = get_user_model() 

# --- Helper Serializer for Participants ---
class ParticipantSerializer(serializers.ModelSerializer):
    """Simple serializer for listing users in a conversation."""
    class Meta:
        model = User
        # Include necessary fields for frontend display (e.g., name, role)
        fields = ['id', 'username', 'first_name', 'last_name']


# =========================================================================
# 1. ANNOUNCEMENT SERIALIZERS
# =========================================================================

class AnnouncementSerializer(serializers.ModelSerializer):
    """
    Serializer for creating and listing broadcast announcements.
    """
    sender_username = serializers.CharField(source='sender.username', read_only=True)
    
    class Meta:
        model = Announcement
        fields = [
            'id', 'sender', 'sender_username', 'scope_type', 'target_school', 
            'target_class', 'target_user', 'title', 'content', 
            'is_notification', 'is_urgent', 'created_at'
        ]
        read_only_fields = ['sender', 'created_at']

# =========================================================================
# 2. CONVERSATION SERIALIZERS
# =========================================================================

class ConversationSerializer(serializers.ModelSerializer):
    """
    Serializer for listing conversations (the inbox view).
    Annotates with last message time and unread count.
    """
    participants_detail = ParticipantSerializer(source='participants', many=True, read_only=True)
    last_message_content = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Conversation
        fields = [
            'id', 'subject', 'participants', 'participants_detail', 
            'last_message_at', 'last_message_content', 'unread_count'
        ]
        read_only_fields = ['participants']

    def get_last_message_content(self, obj):
        """Fetches the content of the most recent message."""
        last_message = obj.messages.order_by('-timestamp').first()
        return last_message.content if last_message else "No messages yet."

    def get_unread_count(self, obj):
        """Calculates the number of unread messages for the current user in this conversation."""
        user = self.context['request'].user
        
        # Count messages in this conversation that exist in the UnreadMessage table for the user
        return UnreadMessage.objects.filter(
            user=user, 
            message__conversation=obj
        ).count()


class ConversationCreateSerializer(serializers.Serializer):
    """
    Input serializer for starting a new conversation, requiring a recipient ID.
    """
    recipient_id = serializers.IntegerField(required=True)
    
    def validate_recipient_id(self, value):
        """Ensures the recipient ID corresponds to an existing, valid user."""
        try:
            recipient = User.objects.get(pk=value)
            
            # Optional: Add checks here (e.g., prevent chatting with self, ensure same school)
            if self.context['request'].user.id == value:
                 raise serializers.ValidationError("Cannot start a conversation with yourself.")
                 
        except User.DoesNotExist:
            raise serializers.ValidationError("Recipient user not found.")
            
        return value

# =========================================================================
# 3. MESSAGE SERIALIZERS
# =========================================================================

class MessageSerializer(serializers.ModelSerializer):
    """
    Serializer for viewing chat history and sending new messages.
    """
    sender_username = serializers.CharField(source='sender.username', read_only=True)
    sender_id = serializers.IntegerField(source='sender.id', read_only=True)
    
    class Meta:
        model = Message
        fields = [
            'id', 'conversation', 'sender_id', 'sender_username', 
            'content', 'attachment', 'timestamp'
        ]
        read_only_fields = ['conversation', 'sender', 'timestamp']