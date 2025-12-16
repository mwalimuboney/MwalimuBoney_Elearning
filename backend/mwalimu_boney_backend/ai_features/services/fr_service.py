# Placeholder for integration with an external FR API (e.g., AWS Rekognition, Azure Face, or a local model)
import face_recognition


class FacialRecognitionService:
    
    @staticmethod
    def generate_template(image_data: bytes) -> bytes:
        """Takes a raw image and returns a secure biometric template/vector."""
        # Call external FR API / Internal Model (expensive operation, ideally run on Celery)
        # Returns a proprietary binary template.
        # Placeholder: Returns a simple hash of the image data for demonstration
        import hashlib
        return hashlib.sha256(image_data).digest() 
    
    @staticmethod
    def compare_faces(template1: bytes, template2: bytes) -> float:
        """Compares two templates and returns a similarity score (0.0 to 1.0)."""
        # Call external FR API / Internal Model
        # Placeholder: If the templates are identical (for testing), return 1.0, otherwise 0.5
        return 1.0 if template1 == template2 else 0.5


# (Modification)

class FacialRecognitionService:
    
    @staticmethod
    def _get_encoding_from_image(image_data: bytes) -> bytes | None:
        """Helper to convert raw image bytes to a face encoding."""
        import io
        import face_recognition

        # image = face_recognition.load_image_file(io.BytesIO(image_data))
        # encodings = face_recognition.face_encodings(image)
        #modified
        """Helper to convert raw image bytes to a face encoding (template)."""
        try:
            image = face_recognition.load_image_file(io.BytesIO(image_data))
            encodings = face_recognition.face_encodings(image)
            return encodings[0].tobytes() if encodings else None
        except Exception as e:
            # Handle cases where image is corrupted or library fails
            print(f"FR Encoding Error: {e}")
            return None
        
        # return encodings[0].tobytes() if encodings else None

    @staticmethod
    def verify_match(live_image_data: bytes, stored_template: bytes, threshold: float) -> float:
        """
        Compares a live image scan to a stored template.
        Returns the highest similarity score (0.0 to 1.0).
        """
        live_template = FacialRecognitionService._get_encoding_from_image(live_image_data)
        
        if not live_template or not stored_template:
            return 0.0 # Cannot compare
            
        # Convert binary templates back to numpy arrays for comparison
        import numpy as np
        stored_encoding = np.frombuffer(stored_template, dtype=np.float64)
        live_encoding = np.frombuffer(live_template, dtype=np.float64)

        # 1. Perform the comparison (returns distance, not similarity)
        face_distances = face_recognition.face_distance([stored_encoding], live_encoding)
        
        # 2. Convert distance to a similarity score (closer to 1.0 is better)
        # Similarity = 1 - distance (conceptually)
        # dlib distances are usually between 0.0 and 1.0 (sometimes slightly more)
        distance = face_distances[0]
        similarity_score = max(0.0, 1.0 - distance) 
        
        return similarity_score