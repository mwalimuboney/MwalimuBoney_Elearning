# chat/views.py
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from .models import ChatMessage

@api_view(['PUT'])
@permission_classes([IsAdminUser | IsAuthenticated]) # Custom permission needed for IsTeacherOrAdmin
def flag_abusive_chat(request, message_id):
    """Allows Admin/Teacher to flag a message as abusive."""
    try:
        message = ChatMessage.objects.get(id=message_id)
    except ChatMessage.DoesNotExist:
        return Response({'detail': 'Message not found.'}, status=status.HTTP_404_NOT_FOUND)

    # NOTE: You need a custom permission class that checks for TEACHER or ADMINISTRATOR role
    # For now, we'll assume only IsAuthenticated users can try, but you must restrict this.
    
    if request.user.profile.role in ['TEACHER', 'ADMINISTRATOR']:
        message.is_abusive = True
        message.save()
        return Response({'status': 'Message successfully flagged as abusive.'}, status=status.HTTP_200_OK)
    else:
        return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
