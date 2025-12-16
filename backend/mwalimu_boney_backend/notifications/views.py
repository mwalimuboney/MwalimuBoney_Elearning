from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from users.permissions import IsTeacherOrAdmin


# Create your views here.
# notifications/views.py (New DRF ViewSet/API View)
from rest_framework.decorators import action
# ...
class NotificationAPIView(APIView):
    permission_classes = [IsTeacherOrAdmin]

    # Endpoint: POST /api/notifications/send/mass/
    def post(self, request, *args, **kwargs):
        # 1. Get targets (e.g., list of student IDs or 'course:42') and message content from request.data
        # 2. Call the CommunicationService to send the message(s).
        # 3. Log the action to NotificationLog.
        return Response({'status': 'Messages queued for sending.'}, status=202)
    
    # Endpoint: GET /api/notifications/targets/?course=42
    @action(detail=False, methods=['get'])
    def get_course_students(self, request):
        # Returns a list of student names/IDs for the course (no sensitive contact data)
        # Used to populate the list of recipients in the Angular UI.
        course_id = request.query_params.get('course')
        if not course_id:
            return Response({'error': 'course parameter is required'}, status=400)
        
        # TODO: Query students enrolled in the course
        student_list = []
        return Response(student_list)