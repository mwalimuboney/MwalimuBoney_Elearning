# FILE: exams/views.py

from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import IntegrityError
from users.models import User # Import the base User model

from .models import Exam, ExamRegistration
from .serializers import ExamRegistrationSerializer, ExamSerializer, ExamStartInputSerializer
from users.models import UserProfile # Needed to access assessment_number

# --- 1. List Available Exams for Registration ---
class ExamListView(generics.ListAPIView):
    """Lists all active exams that require registration."""
    serializer_class = ExamSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Only show exams requiring registration and specific to the student's school
        return Exam.objects.filter(
            school=self.request.user.profile.school,
            is_active=True,
            requires_registration=True
        )

# --- 2. Register for an Exam and Generate Assessment Number (If missing) ---
class ExamRegisterView(APIView):
    """
    Handles student registration and generates the unique assessment number
    on the first registration attempt.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, exam_id):
        user = request.user
        
        try:
            exam = Exam.objects.get(pk=exam_id, requires_registration=True)
        except Exam.DoesNotExist:
            return Response({"detail": "Exam not found or does not require registration."}, 
                            status=status.HTTP_404_NOT_FOUND)

        profile = user.profile
        
        # 1. Generate Assessment Number if Missing
        if not profile.assessment_number:
            # NOTE: Implement a robust service for generation (e.g., using UUIDs or sequencing)
            new_assessment_number = self._generate_unique_assessment_number(profile.school.id)
            profile.assessment_number = new_assessment_number
            profile.save()
            message = f"Registration successful! Your unique Assessment Number is: {new_assessment_number}. Please save it."
        else:
            message = "Registration successful. You have already received your Assessment Number."

        # 2. Create ExamRegistration Record
        try:
            ExamRegistration.objects.create(student=user, exam=exam, status='REGISTERED')
        except IntegrityError:
            return Response({"detail": "You are already registered for this exam."}, 
                            status=status.HTTP_400_BAD_REQUEST)
        
        return Response({"detail": message, "assessment_number": profile.assessment_number}, 
                        status=status.HTTP_201_CREATED)
    
    # Placeholder method - Implement this in a service file for real security
    def _generate_unique_assessment_number(self, school_id):
        # Example generation: SCHOOLCODE + TIMESTAMP_HEX
        import time
        return f"AS-{school_id}-{hex(int(time.time()))}"


# --- 3. List Student's Own Registrations ---
class StudentRegistrationListView(generics.ListAPIView):
    """Lists the exams the logged-in student has registered for."""
    serializer_class = ExamRegistrationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ExamRegistration.objects.filter(student=self.request.user).select_related('exam')



# --- 4. Admin/Teacher List All Registrations for an Exam ---
class ExamRegistrationListAdminView(generics.ListAPIView):
    """Lists all registered students for a specific exam (Admin/Teacher view)."""
    serializer_class = ExamRegistrationSerializer
    permission_classes = [IsAuthenticated] # Implement IsAdminOrTeacher permission

    def get_queryset(self):
        exam_id = self.kwargs.get('exam_id')
        # Ensure the exam belongs to the admin's school
        return ExamRegistration.objects.filter(
            exam_id=exam_id, 
            exam__school=self.request.user.profile.school
        ).select_related('student', 'exam')

# --- 5. Admin Shortlisting Update (Approve/Reject) ---
class ExamRegistrationShortlistView(generics.UpdateAPIView):
    """Allows Admin/Teacher to change a registration status (SHORTLISTED/REJECTED)."""
    queryset = ExamRegistration.objects.all()
    serializer_class = ExamRegistrationSerializer
    permission_classes = [IsAuthenticated] # Implement IsAdminOrTeacher permission
    lookup_field = 'pk'
    
    def update(self, request, *args, **kwargs):
        # Only allow updating status and shortlist_reason
        # Ensure the admin can only modify registrations in their own school
        instance = self.get_object()
        if instance.exam.school != request.user.profile.school:
            return Response({"detail": "Not authorized to modify this record."}, 
                            status=status.HTTP_403_FORBIDDEN)
            
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)
    


# --- 6. Exam Start View (Enforcing Security and Registration) ---
class ExamStartView(APIView):
    """
    Validates user credentials (assessment number) and security prerequisites
    (shortlisting, whitelisting) before starting an exam attempt.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, exam_id):
        serializer = ExamStartInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        entered_assessment_number = serializer.validated_data['assessment_number']
        user = request.user
        
        # 1. Assessment Number Validation
        if user.profile.assessment_number != entered_assessment_number:
            return Response({"detail": "Invalid assessment number provided."}, 
                            status=status.HTTP_403_FORBIDDEN)

        # 2. Whitelisting/Blacklisting Check
        if not user.profile.is_whitelisted:
            return Response({
                "detail": "Assessment number is blacklisted due to administrative reasons (e.g., irregularities or fee status)."
            }, status=status.HTTP_403_FORBIDDEN)

        # 3. Shortlisting Check (Requires registration and SHORTLISTED status)
        try:
            registration = ExamRegistration.objects.get(
                student=user,
                exam_id=exam_id,
                status='SHORTLISTED'
            )
        except ExamRegistration.DoesNotExist:
            return Response({
                "detail": "You are not shortlisted for this exam. Check registration status or contact admin."
            }, status=status.HTTP_403_FORBIDDEN)

        # 4. Check Exam Timing
        exam = registration.exam
        # (Add logic here to check if the current time is between exam.start_time and exam.end_time)
        
        # If all checks pass, create the ExamAttempt record and proceed
        # Example:
        # attempt = ExamAttempt.objects.create(student=user, exam=exam)
        
        return Response({
            "detail": "All security and registration checks passed. Exam is starting.",
            "exam_title": exam.title
            # "attempt_id": attempt.id
        }, status=status.HTTP_200_OK)