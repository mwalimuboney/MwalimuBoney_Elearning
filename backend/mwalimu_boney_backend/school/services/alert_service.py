# schools/services/alert_service.py

from users.models import User, UserProfile
from messaging.services import WhatsAppService # Assuming a dedicated service for WhatsApp
from django.contrib.sites.models import Site
from school.tasks import send_security_alert_task


class AlertService:
    
    @staticmethod
    def get_google_maps_link(lat: float, lon: float) -> str:
        """Generates a Google Maps link for easy tracking."""
        return f"https://www.google.com/maps/search/?api=1&query={lat},{lon}"

    @staticmethod
    def create_security_alert(user_id: int, violation_type: str, violation_details: dict, reported_lat: float, reported_lon: float):
        """
        Gathers data and triggers the asynchronous notification task.
        """
        try:
            student = User.objects.get(id=user_id)
            profile = student.profile # Assuming UserProfile linkage
            
            # 1. Gather all required student data
            student_data = {
                'name': student.get_full_name() or student.username,
                'email': student.email,
                'admission_number': profile.admission_number, # Requires adding this field to UserProfile
                'phone_number': profile.phone_number,
                # 'photo_url': profile.photo.url if profile.photo else 'N/A', # Requires storing photo
            }
            
            # 2. Generate Map Link
            map_link = AlertService.get_google_maps_link(reported_lat, reported_lon)
            
            alert_payload = {
                **student_data,
                'violation_type': violation_type,
                'violation_details': violation_details,
                'reported_location': f"{reported_lat}, {reported_lon}",
                'map_link': map_link
            }

            # 3. Dispatch alert asynchronously
            send_security_alert_task.delay(alert_payload)
            
        except User.DoesNotExist:
            print(f"Error: Student with ID {user_id} not found for alert.")