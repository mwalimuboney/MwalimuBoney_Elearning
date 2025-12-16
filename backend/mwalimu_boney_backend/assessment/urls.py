# assessment/urls.py
from rest_framework.routers import SimpleRouter
from django.urls import path
from .views import ExamManagerViewSet, StudentAssessmentView, LearningProgressReadOnlyViewSet, ManualGradeViewSet

router = SimpleRouter()
router.register(r'exams', ExamManagerViewSet)
router.register(r'student/assessments', StudentAssessmentView, basename='student-assessment')
router.register(r'progress', LearningProgressReadOnlyViewSet)
router.register(r'grades', ManualGradeViewSet) # New endpoint
urlpatterns = router.urls