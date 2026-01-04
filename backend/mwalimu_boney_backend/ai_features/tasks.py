
from celery import shared_task
import face_recognition # The open-source library
from users.models import UserProfile 
from ai_features.services.fr_service import FacialRecognitionService

@shared_task
def generate_and_save_facial_template(user_id: int, image_data: bytes):
    try:
        # 1. Load the image from the raw bytes data
        import numpy as np
        import io
        from PIL import Image
        
        image = face_recognition.load_image_file(io.BytesIO(image_data))
        
        # 2. Find the face encoding (the template/vector)
        # This is the resource-intensive step
        encodings = face_recognition.face_encodings(image)
        
        if not encodings:
            raise ValueError("No face detected in the provided image.")

        # Use the first detected face (assuming one person per passport photo)
        # template = encodings[0].tobytes()
        """Asynchronously generates the FR template and saves it to the UserProfile."""
        template = FacialRecognitionService._get_encoding_from_image(image_data)
    
        if template:
            UserProfile.objects.filter(user_id=user_id).update(facial_template=template)
        else:
        # Log this failure and notify the admin/user
            print(f"FR Enrollment failed for User {user_id}: No face detected.")
        
        # 3. Save the template to the user profile
        UserProfile.objects.filter(user_id=user_id).update(facial_template=template)
        
    except Exception as e:
        # Handle exceptions (e.g., no face detected, memory error)
        print(f"FR Template Generation Failed for User {user_id}: {e}")
        # Notify Admin/User about enrollment failure