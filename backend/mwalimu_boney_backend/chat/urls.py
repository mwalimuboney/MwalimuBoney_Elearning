# chat/urls.py
from django.urls import path
from .views import flag_abusive_chat

urlpatterns = [
    path('chat/flag/<int:message_id>/', flag_abusive_chat, name='flag_abusive_chat'),
]