# courses/views.py
from rest_framework import viewsets, status
from .models import Course, Lesson, Resource, Announcement
from .serializers import CourseSerializer, LessonSerializer, ResourceSerializer, AnnouncementSerializer
from rest_framework import permissions
from rest_framework.permissions import IsAuthenticated 
from users.permissions import IsTeacherOrAdmin, IsOwnerOrAdminOrTeacher
from django.core.files.storage import default_storage
from rest_framework.response import Response

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


class AnnouncementViewSet(viewsets.ModelViewSet):
    """Teachers/Admins can create announcements, all users can read their feed."""
    serializer_class = AnnouncementSerializer

    def get_permissions(self):
        # Only Teachers/Admins can create/update/delete
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [IsTeacherOrAdmin]
        else:
            # All authenticated users can read the announcements
            self.permission_classes = [permissions.IsAuthenticated]
        return super().get_permissions()

    def perform_create(self, serializer):
        serializer.save(teacher=self.request.user)

    def get_queryset(self):
        # Student Feed: Global announcements OR announcements for their enrolled courses
        # NOTE: Assumes you have an Enrollment model later; for now, let's filter by global only
        user = self.request.user
        if user.is_authenticated:
            # Students see global announcements and announcements for courses they are linked to (future expansion)
            return Announcement.objects.filter(is_global=True)
        return Announcement.objects.none()


class RteImageUploadView(viewsets.ViewSet):
    """
    API endpoint to handle image uploads from Rich Text Editors (RTE) like TinyMCE.
    Accepts image files via POST and returns the URL for embedding.
    """
    permission_classes = [IsAuthenticated]

    def create(self, request):
        image_file = request.FILES.get('file')
        if not image_file:
            return Response({'detail': 'No image file provided.'}, status=status.HTTP_400_BAD_REQUEST)

        # SECURITY: You would run Antivirus check here if needed, but it's simplified for the RTE.
        
        # Save the file using Django's default storage (S3 or local filesystem)
        try:
            file_name = default_storage.save(f'rte_images/{image_file.name}', image_file)
            file_url = default_storage.url(file_name)
            
            # TinyMCE/RTE expects the JSON response: { location: "URL_OF_IMAGE" }
            return Response({'location': file_url}, status=status.HTTP_200_OK)
        except Exception as e:
            print(f"RTE Image Upload Error: {e}")
            return Response({'detail': 'Internal file storage error.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

