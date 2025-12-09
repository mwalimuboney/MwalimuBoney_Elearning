# chat/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from .models import ChatMessage
from django.contrib.auth.models import User

class GlobalChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Authenticated users only
        if not self.scope["user"].is_authenticated:
            await self.close()
            return
            
        self.room_name = 'global'
        self.room_group_name = 'chat_%s' % self.room_name

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

        # Load history and send it to the connecting user
        messages = await self.get_last_10_messages()
        await self.send(text_data=json.dumps({
            'type': 'chat_history',
            'messages': messages
        }))

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from WebSocket
    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data['message']
        
        # Save message to database (must use sync_to_async)
        message_object = await self.create_chat_message(self.scope["user"], message)

        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'username': self.scope["user"].username,
                'timestamp': str(message_object.timestamp)
            }
        )

    # Receive message from room group
    async def chat_message(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'new_message',
            'message': event['message'],
            'username': event['username'],
            'timestamp': event['timestamp']
        }))
        
    @sync_to_async
    def create_chat_message(self, user, content):
        """Saves message to the database."""
        return ChatMessage.objects.create(user=user, content=content)

    @sync_to_async
    def get_last_10_messages(self):
        """Retrieves the last 10 messages for history."""
        messages = ChatMessage.objects.filter(room_name='global').order_by('-timestamp')[:10]
        data = []
        for msg in reversed(messages):
            data.append({
                'username': msg.user.username,
                'content': msg.content,
                'timestamp': str(msg.timestamp)
            })
        return data