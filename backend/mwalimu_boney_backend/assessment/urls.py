# assessment/urls.py
from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import ExamManagerViewSet, StudentAssessmentView, LearningProgressReadOnlyViewSet

router = DefaultRouter()
router.register(r'exams', ExamManagerViewSet)
router.register(r'student/assessments', StudentAssessmentView, basename='student-assessment')
router.register(r'progress', LearningProgressReadOnlyViewSet)

urlpatterns = router.urls