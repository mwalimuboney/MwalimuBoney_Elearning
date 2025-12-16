
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.core.files.storage import default_storage
from django.conf import settings
from rest_framework.parsers import MultiPartParser, FormParser
from .services.file_extraction_service import FileExtractionService # Import the new service
from .tasks import generate_and_save_facial_template
from school.models import FRSettings # Model for admin control (FRSettings)
from .services.ai_content_service import AIContentService
# from .serializers import AISummarySerializer # We need a serializer for validation

# Define a simple serializer for validating input
from rest_framework import serializers
class AISummarySerializer(serializers.Serializer):
    text = serializers.CharField(max_length=5000) # Limit input size for performance
    
class SummarizeTextView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = AISummarySerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        input_text = serializer.validated_data['text']
        
        # 1. Check User Limits (Optional: Rate-limit this feature)
        # if user_exceeded_ai_quota(request.user):
        #     return Response({'detail': 'Daily AI quota exceeded.'}, status.HTTP_429_TOO_MANY_REQUESTS)
        
        try:
            # 2. Call the service layer to get the summary
            summary = AIContentService.summarize_text(input_text)
            
            # 3. Return the result to the Angular frontend
            return Response({'summary': summary}, status=status.HTTP_200_OK)
            
        except Exception as e:
            # Log the exception for debugging the AI service
            print(f"AI Service Error: {e}") 
            return Response(
                {'detail': 'AI processing failed. Please try again later.'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )




class FileExtractionView(APIView):
    # Allows receiving files via POST requests
    parser_classes = (MultiPartParser, FormParser) 
    permission_classes = [IsAuthenticated] # Only logged-in teachers/admins can use this

    def post(self, request, *args, **kwargs):
        # The file is expected to be under the key 'file' in the FormData
        uploaded_file = request.data.get('file')

        if not uploaded_file:
            return Response({"detail": "No file uploaded."}, status=status.HTTP_400_BAD_REQUEST)
        
        # --- File Size and Type Validation ---
        
        # Limit file size for performance
        if uploaded_file.size > 5 * 1024 * 1024: # 5MB limit
            return Response({"detail": "File size exceeds 5MB limit."}, status=status.HTTP_400_BAD_REQUEST)

        # Basic MIME type check
        filename = uploaded_file.name.lower()
        if not (filename.endswith('.pdf') or filename.endswith('.docx')):
            return Response({"detail": "Unsupported file type. Only PDF and DOCX are supported."}, 
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            # Delegate to the service layer for actual extraction
            extracted_text = FileExtractionService.extract_text(uploaded_file)
            
            return Response({"content": extracted_text}, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"Extraction Error: {e}")
            return Response(
                {"detail": f"Text extraction failed: {e}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        

class QuestionGenerateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = AISummarySerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        input_text = serializer.validated_data['text']
        
        try:
            questions = AIContentService.generate_questions(input_text)
            return Response({'questions': questions}, status=status.HTTP_200_OK)
            
        except Exception as e:
            print(f"AI Service Error: {e}") 
            return Response(
                {'detail': 'AI processing failed. Please try again later.'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        




from .services.file_extraction_service import FileExtractionService # Assume you've created this service

# --- 1. Text Extraction View (for PDF/DOCX) ---
class FileExtractionView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        uploaded_file = request.data.get('file')
        if not uploaded_file:
            return Response({"detail": "No file uploaded."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Service extracts text using PyPDF2/python-docx (FileExtractionService is detailed previously)
            extracted_text = FileExtractionService.extract_text(uploaded_file)
            
            return Response({"content": extracted_text}, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"Extraction Error: {e}")
            return Response(
                {"detail": f"Text extraction failed."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# --- 2. RTE Image Upload View (for Drag-and-Drop) ---
class RteImageUploadView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        image_file = request.data.get('file')
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
        

# --- 1. FR Enrollment Trigger View ---
class FRTemplateEnrollmentView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsAuthenticated]

    def post(self, request):
        live_photo = request.data.get('live_photo')
        if not live_photo:
            return Response({'detail': 'No photo provided.'}, status=status.HTTP_400_BAD_REQUEST)

        # Read the raw image data from the UploadedFile object
        image_data = live_photo.read()
        
        # Trigger the heavy template generation asynchronously via Celery
        generate_and_save_facial_template.delay(request.user.id, image_data)
        
        return Response({
            'detail': 'Facial enrollment started successfully. Template will be saved shortly.'
        }, status=status.HTTP_202_ACCEPTED)

# --- 2. Admin Settings Control View ---
class FRSettingsView(APIView):
    # This view allows Admins to modify FRSettings.
    # Assumes permission_classes includes an IsAdmin check.
    permission_classes = [IsAuthenticated] # Simplified check

    def get(self, request):
        # Retrieve settings for the user's school
        settings, created = FRSettings.objects.get_or_create(school=request.user.profile.school)
        return Response({
            'enforce_teacher_login_fr': settings.enforce_teacher_login_fr,
            'enforce_exam_start_fr': settings.enforce_exam_start_fr,
            'similarity_threshold': settings.similarity_threshold,
        })
    
    def put(self, request):
        settings = FRSettings.objects.get(school=request.user.profile.school)
        
        # Update fields based on admin input
        settings.enforce_teacher_login_fr = request.data.get('enforce_teacher_login_fr', settings.enforce_teacher_login_fr)
        settings.enforce_exam_start_fr = request.data.get('enforce_exam_start_fr', settings.enforce_exam_start_fr)
        settings.similarity_threshold = request.data.get('similarity_threshold', settings.similarity_threshold)
        
        settings.save()
        return Response({'detail': 'FR settings updated successfully.'}, status=status.HTTP_200_OK)