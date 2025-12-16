# FILE: exams/urls.py

from django.urls import path
from .views import (
    ExamListView,
    ExamRegisterView,
    StudentRegistrationListView,
    ExamRegistrationListAdminView,
    ExamRegistrationShortlistView,
    ExamStartView,
)

urlpatterns = [
    # --- Student Registration Workflow ---
    
    # GET: List all exams available for registration
    path('register/list/', 
         ExamListView.as_view(), 
         name='exam_list'),
         
    # POST: Register for a specific exam (Triggers assessment number generation)
    path('register/<int:exam_id>/', 
         ExamRegisterView.as_view(), 
         name='exam_register'),
         
    # GET: List the current user's registrations (for student status checks)
    path('my-registrations/', 
         StudentRegistrationListView.as_view(), 
         name='my_registrations'),

    # --- Exam Start Workflow ---
    
    # POST: Critical endpoint to start the exam after checking assessment number, 
    # shortlisting, and whitelisting.
    path('start/<int:exam_id>/', 
         ExamStartView.as_view(), 
         name='exam_start'),

    # --- Admin/Teacher Shortlisting Workflow ---
    
    # GET: List all students registered for a specific exam (Admin/Teacher view)
    path('admin/registrations/<int:exam_id>/', 
         ExamRegistrationListAdminView.as_view(), 
         name='admin_exam_registrations'),
         
    # PUT/PATCH: Update registration status (Shortlist/Reject) by ID
    path('admin/shortlist/<int:pk>/', 
         ExamRegistrationShortlistView.as_view(), 
         name='admin_registration_shortlist'),
]