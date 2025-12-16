# FILE: communications/routing.py

from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    # Match a path like ws/chat/lesson/123/
    re_path(r'ws/chat/lesson/(?P<lesson_id>\w+)/$', consumers.LessonChatConsumer.as_asgi()),
]