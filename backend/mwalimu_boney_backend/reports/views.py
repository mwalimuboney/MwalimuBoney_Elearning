# reports/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.http import HttpResponse
from rest_framework.permissions import IsAuthenticated
from .services import ReportGeneratorService
from users.models import UserProfile # Used for role checking

# Third-party library for PDF generation (e.g., WeasyPrint, html2pdf, ReportLab)
# We will use Django's built-in rendering for HTML-to-PDF generation (Conceptual)
from django.template.loader import render_to_string 

class ReportCardView(APIView):
    # Only authenticated users (who are not just external) can access
    permission_classes = [IsAuthenticated] 

    def get(self, request, student_user_id):
        user = request.user
        
        # 1. Date Range Parameters (Assume passed in query params)
        start_date = request.query_params.get('start', '2024-01-01')
        end_date = request.query_params.get('end', '2024-12-31')
        
        # 2. Security Scoping Check (CRITICAL)
        try:
            target_profile = UserProfile.objects.get(user_id=student_user_id)
        except UserProfile.DoesNotExist:
            return Response({"detail": "Student not found."}, status=status.HTTP_404_NOT_FOUND)

        requester_profile = user.profile
        
        # Check 1: Is the requester an Admin of the school?
        is_school_admin = (requester_profile.role == 'ADMINISTRATOR' and 
                           requester_profile.school == target_profile.school)
        # Check 2: Is the requester the Student themselves?
        is_self = (student_user_id == user.id)
        # Check 3: Is the requester the Parent of this Student?
        is_parent = (requester_profile.role == 'PARENT' and 
                     target_profile.parent_id == user.id)
        # Check 4: Is the requester the Class Teacher?
        is_class_teacher = (requester_profile.role == 'TEACHER' and 
                            target_profile.current_class == requester_profile.classes_taught.first())
        
        # Only allow access if one of the above conditions is met AND the schools match.
        if not (is_school_admin or is_self or is_parent or is_class_teacher):
             return Response({"detail": "Permission denied. Not authorized to view this report."}, 
                             status=status.HTTP_403_FORBIDDEN)
        
        # 3. Generate Report Data
        report_service = ReportGeneratorService(school=target_profile.school)
        report_context = report_service.generate_report_data(
            student_user_id, 
            start_date, 
            end_date
        )

        if not report_context:
            return Response({"detail": "No grading data found for this period."}, status=status.HTTP_404_NOT_FOUND)

        # 4. Render to PDF
        html_content = render_to_string('reports/report_card_template.html', report_context)
        
        # --- Conceptual PDF Generation Step ---
        # Actual PDF generation using WeasyPrint or similar library
        # Example: pdf = HTML(string=html_content).write_pdf() 
        pdf_file_content = b"PDF_FILE_CONTENT_PLACEHOLDER"

        # 5. Return PDF Response
        response = HttpResponse(pdf_file_content, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="ReportCard_{target_profile.user.username}.pdf"'
        return response