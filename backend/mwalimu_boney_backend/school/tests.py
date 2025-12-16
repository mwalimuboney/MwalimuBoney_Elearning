# schools/tests.py (for Multi-Tenancy Scoping)

from rest_framework.test import APITestCase
from users.models import User, UserProfile
from school.models import School, Class
from courses.models import Course

class MultiTenancySecurityTests(APITestCase):

    def setUp(self):
        # 1. Setup two distinct schools
        self.school_A = School.objects.create(name="School Alpha")
        self.school_B = School.objects.create(name="School Beta")
        
        # 2. Setup user for each school
        self.student_A = User.objects.create_user(username="studentA", password="password")
        self.profile_A = UserProfile.objects.create(user=self.student_A, school=self.school_A, role='STUDENT')
        
        self.student_B = User.objects.create_user(username="studentB", password="password")
        self.profile_B = UserProfile.objects.create(user=self.student_B, school=self.school_B, role='STUDENT')
        
        # 3. Create one course in each school
        self.course_A = Course.objects.create(title="Alpha Algebra", school=self.school_A, is_published=True)
        self.course_B = Course.objects.create(title="Beta Biology", school=self.school_B, is_published=True)

        self.course_list_url = '/api/courses/'

    def test_student_only_sees_own_schools_courses(self):
        """
        Ensure Student A, associated with School A, only receives Course A 
        and is blocked from seeing Course B (School B).
        """
        # Log in as Student A
        self.client.login(username='studentA', password='password')
        
        # Attempt to retrieve all courses
        response = self.client.get(self.course_list_url)
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1) # Must only see one course
        
        retrieved_course_titles = [item['title'] for item in response.data]
        
        # Verification: Course A is present, Course B is not
        self.assertIn(self.course_A.title, retrieved_course_titles)
        self.assertNotIn(self.course_B.title, retrieved_course_titles)

    def test_unauthenticated_user_cannot_access_courses(self):
        """Unauthenticated users should be blocked by permission classes."""
        response = self.client.get(self.course_list_url)
        self.assertEqual(response.status_code, 401) # Unauthorized

# Additional tests can be added for Teachers, Admins, and Parents similarly.
