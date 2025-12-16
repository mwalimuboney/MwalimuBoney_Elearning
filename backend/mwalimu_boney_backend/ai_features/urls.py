# ai_features/urls.py

from django.urls import path
from .views import SummarizeTextView
from .views import QuestionGenerateView, FileExtractionView, FRTemplateEnrollmentView, FRSettingsView

urlpatterns = [
    path('summarize/', SummarizeTextView.as_view(), name='ai_summarize'),
    path('generate-questions/', QuestionGenerateView.as_view(), name='ai_generate_questions'),
    path('extract-text/', FileExtractionView.as_view(), name='file_extract_text'),
    path('summarize/', SummarizeTextView.as_view(), name='ai_summarize'),
    path('extract-text/', FileExtractionView.as_view(), name='file_extract_text'),
    path('fr/enroll/', FRTemplateEnrollmentView.as_view(), name='fr_enroll'), # Future FR endpoints
    # Facial Recognition
    path('fr/enroll/trigger/', FRTemplateEnrollmentView.as_view(), name='fr_enroll_trigger'),
    
    # Admin Control (Needs proper permission check in the view)
    path('admin/fr-settings/', FRSettingsView.as_view(), name='admin_fr_settings'),
]

# project/core_config/urls.py (Include in API namespace)
# path('api/ai/', include('ai_features.urls')),