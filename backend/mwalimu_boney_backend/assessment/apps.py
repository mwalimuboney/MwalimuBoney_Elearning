# assessment/apps.py
from django.apps import AppConfig

class AssessmentConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'assessment'

    def ready(self):
        # We must import signals here to ensure they are registered 
        # when Django fully initializes the app.
        try:
            import assessment.signals
        except ImportError:
            # Handle cases where Django might fail to find the module path
            # (less common in modern Django/Codespaces)
            pass
