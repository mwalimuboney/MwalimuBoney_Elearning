# courses/urls.py
from rest_framework.routers import SimpleRouter
from .views import CourseViewSet, LessonViewSet, AnnouncementViewSet, ResourceViewSet, RteImageUploadView

router = SimpleRouter()
router.register(r'courses', CourseViewSet, basename='course')
router.register(r'lessons', LessonViewSet, basename='lesson')
router.register(r'announcements', AnnouncementViewSet, basename='announcement')
router.register(r'resources', ResourceViewSet, basename='resources') # New endpoint for resources
router.register(r'rte-image-upload', RteImageUploadView, basename='rte_image_upload') # RTE Image Upload
urlpatterns = router.urls