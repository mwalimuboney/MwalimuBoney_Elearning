# FILE: communications/views.py

from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser # Use appropriate custom permissions
from django.db.models import Q
from django.http import Http404
from django.db import models
from users.models import User # Base User model

from .models import Announcement, Conversation, Message, UnreadMessage
from .serializers import (
    AnnouncementSerializer, 
    ConversationSerializer, 
    MessageSerializer, 
    ConversationCreateSerializer
)
from users.models import UserProfile # Assuming this holds the role

# --- 1. Announcement List (Recipient View) ---
class AnnouncementListView(generics.ListAPIView):
    """
    Lists announcements relevant to the authenticated user (Student/Teacher/Admin).
    """
    serializer_class = AnnouncementSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        profile = user.profile
        
        # Base query for all announcements in the user's school
        qs = Announcement.objects.filter(school=profile.school)
        
        # Global announcements
        global_q = Q(scope_type='GLOBAL_PUBLIC')

        # School-internal announcements
        school_internal_q = Q(scope_type='SCHOOL_INTERNAL', target_school=profile.school)

        # Class-specific announcements (Assuming profile links to a Class object)
        class_q = Q(scope_type='CLASS', target_class=profile.class_id)
        
        # User-specific announcements
        user_q = Q(scope_type='USER', target_user=user)

        # Combine all relevant filters
        final_q = global_q | school_internal_q | class_q | user_q

        return Announcement.objects.filter(final_q).order_by('-is_urgent', '-created_at')

# --- 2. Announcement Creation (Admin/Teacher View) ---
class AnnouncementCreateView(generics.CreateAPIView):
    """
    Allows Admin/Teachers to create new announcements.
    """
    serializer_class = AnnouncementSerializer
    # NOTE: You must implement a custom permission check (e.g., IsAdminOrTeacher)
    permission_classes = [IsAuthenticated] 

    def perform_create(self, serializer):
        # Automatically set the sender and school
        serializer.save(
            sender=self.request.user,
            school=self.request.user.profile.school
        )

# --- 3. Announcement Detail View (Retrieve/Update/Delete by Admin/Teacher) ---
class AnnouncementDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Allows authorized users (sender/admin) to view, update, or delete an announcement.
    """
    queryset = Announcement.objects.all()
    serializer_class = AnnouncementSerializer
    # NOTE: Implement an IsSenderOrAdmin permission class
    permission_classes = [IsAuthenticated]


# FILE: communications/views.py (Continuation)

# --- 4. Conversation List (Inbox View) ---
class ConversationListView(generics.ListAPIView):
    """
    Lists all conversations the authenticated user is a participant in, 
    showing the latest message summary.
    """
    serializer_class = ConversationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Conversation.objects.filter(
            participants=self.request.user
        ).filter(
            school=self.request.user.profile.school
        ).select_related(
            # Select related for performance improvements
        ).prefetch_related(
            'participants'
        )

# --- 5. Conversation Create (Start a New Chat) ---
class ConversationCreateView(APIView):
    """
    Starts a new conversation with one or more specified users.
    Ensures that only one conversation exists between the exact same participants.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ConversationCreateSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        
        recipient_id = serializer.validated_data['recipient_id']
        # The recipient user object is validated in the serializer
        recipient = User.objects.get(pk=recipient_id)
        current_user = request.user
        
        # Define the set of participants
        participants_set = {current_user, recipient}
        
        # Check if conversation already exists (optimization)
        existing_conv = Conversation.objects.annotate(
            num_participants=models.Count('participants')
        ).filter(
            participants=current_user,
            school=current_user.profile.school,
            num_participants=len(participants_set) # Restrict to two participants
        ).filter(
            participants=recipient
        ).first()

        if existing_conv:
            return Response(ConversationSerializer(existing_conv).data, status=status.HTTP_200_OK)

        # Create new conversation
        conversation = Conversation.objects.create(
            school=current_user.profile.school,
            subject=f"Chat with {recipient.username}"
        )
        conversation.participants.set(participants_set)
        
        return Response(ConversationSerializer(conversation).data, status=status.HTTP_201_CREATED)
    

# FILE: communications/views.py (Continuation)

# --- 6. Message List/Detail (Chat History) ---
class MessageListCreateView(generics.ListCreateAPIView):
    """
    GET: Retrieves all messages in a conversation.
    POST: Creates a new message in the conversation.
    """
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        conv_id = self.kwargs.get('conversation_id')
        user = self.request.user
        
        # Ensure the user is a participant in the conversation
        try:
            conversation = Conversation.objects.get(pk=conv_id, participants=user)
        except Conversation.DoesNotExist:
            raise Http404("Conversation not found or user is not a participant.")

        # Mark all messages in this conversation as read for the user
        UnreadMessage.objects.filter(user=user, message__conversation=conversation).delete()
        
        return Message.objects.filter(conversation=conversation).order_by('timestamp')

    def perform_create(self, serializer):
        conv_id = self.kwargs.get('conversation_id')
        user = self.request.user
        
        conversation = Conversation.objects.get(pk=conv_id, participants=user)
        
        # Save the message
        message = serializer.save(sender=user, conversation=conversation)
        
        # Update last_message_at
        conversation.last_message_at = message.timestamp
        conversation.save()

        # Create UnreadMessage records for ALL OTHER participants
        other_participants = conversation.participants.exclude(pk=user.pk)
        UnreadMessage.objects.bulk_create([
            UnreadMessage(user=participant, message=message)
            for participant in other_participants
        ])

# --- 7. Unread Count View ---
class UnreadCountView(APIView):
    """
    Returns the total count of unread messages/announcements for the user.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        unread_messages_count = UnreadMessage.objects.filter(user=request.user).count()
        # You can add logic here to count unread announcements if you implement an AnnouncementReadStatus model

        return Response({
            "unread_messages": unread_messages_count,
            "total_unread": unread_messages_count
        }, status=status.HTTP_200_OK)
    



