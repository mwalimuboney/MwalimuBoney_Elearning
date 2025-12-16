# FILE: communications/urls.py

from django.urls import path
from .views import (
    # Announcement Views
    AnnouncementListView,
    AnnouncementCreateView,
    AnnouncementDetailView,
    
    # Conversation Views
    ConversationListView,
    ConversationCreateView,
    
    # Message Views
    MessageListCreateView,
    UnreadCountView,
)

urlpatterns = [
    # --- Announcements (Broadcasting) ---
    
    # GET: List announcements relevant to the current user (Student/Teacher view)
    path('announcements/', 
         AnnouncementListView.as_view(), 
         name='announcement_list'),
         
    # POST: Create a new announcement (Admin/Teacher view)
    path('announcements/create/', 
         AnnouncementCreateView.as_view(), 
         name='announcement_create'),
         
    # GET/PUT/DELETE: Retrieve, update, or delete an announcement by ID
    path('announcements/<int:pk>/', 
         AnnouncementDetailView.as_view(), 
         name='announcement_detail'),

    # --- Conversations (Inbox/Private Chat) ---

    # GET: List all conversations the user is a part of (Inbox view)
    path('conversations/', 
         ConversationListView.as_view(), 
         name='conversation_list'),
         
    # POST: Start a new conversation (or retrieve existing one with the same recipient)
    path('conversations/create/', 
         ConversationCreateView.as_view(), 
         name='conversation_create'),

    # --- Messages (Chat History) ---
    
    # GET/POST: List history and send a new message within a specific conversation
    path('conversations/<int:conversation_id>/messages/', 
         MessageListCreateView.as_view(), 
         name='message_list_create'),
         
    # --- Utility ---
    
    # GET: Total count of unread messages/notifications
    path('unread/count/', 
         UnreadCountView.as_view(), 
         name='unread_count'),
]