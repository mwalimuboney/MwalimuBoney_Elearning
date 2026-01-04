# communications/consumers.py
from datetime import datetime
import json
from channels.generic.websocket import AsyncWebsocketConsumer

class LessonChatConsumer(AsyncWebsocketConsumer):
    # This method is called when the WebSocket connects
    async def connect(self):
        # The user object is injected by the TokenAuthMiddlewareStack
        if not self.scope["user"].is_authenticated:
            await self.close()
            return
            
        self.lesson_id = self.scope['url_route']['kwargs']['lesson_id']
        self.lesson_group_name = f'chat_{self.lesson_id}'

        # Join the lesson group (all users in this lesson chat)
        await self.channel_layer.group_add(
            self.lesson_group_name,
            self.channel_name
        )

        await self.accept()

    # This method is called when the WebSocket disconnects
    async def disconnect(self, close_code):
        # Leave the lesson group
        await self.channel_layer.group_discard(
            self.lesson_group_name,
            self.channel_name
        )

    # Receive message from WebSocket (from client)
    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data['message']
        
        # Security check: Ensure user is enrolled in the course containing this lesson
        # (This check should ideally happen here or in the middleware)

        # Send message to the lesson group
        await self.channel_layer.group_send(
            self.lesson_group_name,
            {
                'type': 'chat_message', # Method name to call below
                'message': message,
                'user_id': self.scope["user"].id,
                'username': self.scope["user"].username,
            }
        )

    # Receive message from lesson group (sends to client)
    async def chat_message(self, event):
        # Send data back to the WebSocket
        await self.send(text_data=json.dumps({
            'message': event['message'],
            'user_id': event['user_id'],
            'username': event['username'],
            'timestamp': str(datetime.now())
        }))


