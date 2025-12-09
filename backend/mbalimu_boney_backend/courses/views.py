# courses/views.py
from rest_framework import viewsets, status
from .models import Course, Lesson, Resource
from .serializers import CourseSerializer, LessonSerializer, ResourceSerializer
from rest_framework import permissions
from rest_framework.permissions import IsAuthenticated 
from users.permissions import IsTeacherOrAdmin, IsOwnerOrAdminOrTeacher

class CourseViewSet(viewsets.ModelViewSet):
    """API endpoint that allows courses to be viewed or edited."""
    queryset = Course.objects.all()
    serializer_class = CourseSerializer

class LessonViewSet(viewsets.ModelViewSet):
    """API endpoint that allows lessons to be viewed or edited."""
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    
    # Optionally, you can filter lessons by course if needed
    def get_queryset(self):
        course_id = self.request.query_params.get('course')
        if course_id:
            return Lesson.objects.filter(course__id=course_id)
        return Lesson.objects.all()


class ResourceViewSet(viewsets.ModelViewSet):
    """
    API endpoint for viewing and managing educational resources.
    Creation/Deletion/Alteration restricted to Teachers/Admins.
    """
    queryset = Resource.objects.all().select_related('uploader')
    serializer_class = ResourceSerializer
    
    # Permission logic: Read is public/auth'd, Write requires custom role/ownership
    permission_classes = [IsAuthenticated, IsOwnerOrAdminOrTeacher] 

    def perform_create(self, serializer):
        # Automatically set the uploader to the currently logged-in user
        serializer.save(uploader=self.request.user)

    def get_permissions(self):
        """
        Instantiate and return the list of permissions that this view requires.
        Ensure only Teacher/Admin can POST/PUT/DELETE.
        """
        if self.action in ['create']:
            # Only Teachers and Admins can upload new resources
            self.permission_classes = [IsTeacherOrAdmin]
        elif self.action in ['update', 'partial_update', 'destroy']:
            # Owner, Teacher, or Admin can modify/delete
            self.permission_classes = [IsOwnerOrAdminOrTeacher]
        else:
            # Read actions (list, retrieve) only require authentication
            self.permission_classes = [permissions.IsAuthenticated]

        return [permission() for permission in self.permission_classes]
