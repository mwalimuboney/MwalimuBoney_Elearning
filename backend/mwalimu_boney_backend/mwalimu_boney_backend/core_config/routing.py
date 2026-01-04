# project/core_config/routing.py (New File)

from django.urls import re_path
from communications.consumers import LessonChatConsumer # Import the consumer

import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
# Import custom middleware for JWT authentication over WebSockets
# from jwt_auth.middleware import TokenAuthMiddlewareStack
# from communications.middleware import TokenAuthMiddlewareStack 
import core_config.routing # Import the routing file

from channels.auth import AuthMiddlewareStack


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core_config.settings')

websocket_urlpatterns = [
    # Connects to ws://.../ws/chat/lesson/<lesson_id>/
    re_path(r'ws/chat/lesson/(?P<lesson_id>\d+)/$', LessonChatConsumer.as_asgi()),
]

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    # WebSocket handling
    "websocket": TokenAuthMiddlewareStack(
        URLRouter(
            core_config.routing.websocket_urlpatterns
        )
    ),
})