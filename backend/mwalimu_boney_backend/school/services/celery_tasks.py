# project/celery_tasks.py

from celery import shared_task
from school.models import School
from users.models import User, UserProfile
from messaging.services import WhatsAppService # Assuming a dedicated service for WhatsApp


@shared_task
def send_security_alert_task(payload: dict):
    
    # --- 1. Identify Recipients ---
    # Find the student's school to target the right Admin/Teachers
    try:
        student_profile = UserProfile.objects.get(email=payload['email'])
        school = student_profile.school
    except UserProfile.DoesNotExist:
        return 

    # Find all Admins and relevant Teachers in the school
    recipients = list(User.objects.filter(
        profile__school=school, 
        profile__role__in=['ADMINISTRATOR', 'TEACHER']
    ).select_related('profile'))

    # --- 2. Format the Message Content ---
    
    portal_message = f"""
    ### 🚨 Exam Security Violation: {payload['violation_type']} 🚨
    - **Student Name:** {payload['name']}
    - **Admission/Email:** {payload['admission_number']} / {payload['email']}
    - **Phone:** {payload['phone_number']}
    - **Violation:** {payload['violation_details']}
    - **Location:** {payload['reported_location']}
    - **Tracking Link:** {payload['map_link']} (Open in Google Maps)
    """
    
    whatsapp_message = (
        f"🚨 *SECURITY ALERT* 🚨\n"
        f"Violation: {payload['violation_type']}\n"
        f"Name: {payload['name']} ({payload['admission_number']})\n"
        f"Location: {payload['reported_location']}\n"
        f"Map Link: {payload['map_link']}"
    )

    # --- 3. Dispatch Alerts ---

    for recipient in recipients:
        # a) Send to Internal Portal (e.g., store in a Notifications model for the Admin/Teacher portal)
        # Notification.objects.create(recipient=recipient, message=portal_message, type='SECURITY')
        
        # b) Send via WhatsApp (if a phone number is available)
        if recipient.profile.phone_number:
            # Assumes WhatsAppService can send a message using the user's saved number
            WhatsAppService.send_message(
                recipient.profile.phone_number, 
                whatsapp_message
            )
            
    print(f"Dispatched alert for {payload['name']} to {len(recipients)} staff members.")