# chat/routing.py
from django.urls import re_path

from . import consumers

websocket_urlpatterns = [
    # Maps the URL path 'ws/chat/global/' to the GlobalChatConsumer
    re_path(r'ws/chat/global/$', consumers.GlobalChatConsumer.as_asgi()), 
]