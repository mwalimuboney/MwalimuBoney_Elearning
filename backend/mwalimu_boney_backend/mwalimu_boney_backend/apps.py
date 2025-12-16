from django.apps import AppConfig


class MwalimuBoneyBackendConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'mwalimu_boney_backend'

    def ready(self):
        # Import centralized admin registrations after apps are ready.
        # Use a try/except to avoid breaking startup if admin module has issues.
        try:
            import mwalimu_boney_backend.admin  # noqa: F401
        except Exception:
            # Admin registration errors should not prevent the app from starting.
            pass
