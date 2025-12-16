# FILE: courses/services.py

from django.db.models import Count, Q
from courses.models import Course, Lesson, Quiz # Assuming Lesson is related to Course
from progress.models import LessonCompletion, QuizAttempt # To check progress

class CourseService:
    """
    Service layer containing business logic related to course state and progress calculation.
    """

    @staticmethod
    def is_course_complete(user, course_id):
        """
        Determines if a student has met all completion requirements for a given course.
        
        A typical completion requirement includes:
        1. Completion of all required lessons.
        2. Passing all mandatory quizzes.
        """
        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return False

        # --- 1. Check Mandatory Lesson Completion ---
        # Assuming lessons are defined under the course
        required_lessons = Lesson.objects.filter(course=course)
        total_lessons = required_lessons.count()
        
        if total_lessons == 0:
            # If a course has no lessons, completion depends on quizzes/exams
            pass
        else:
            completed_lessons_count = LessonCompletion.objects.filter(
                student=user,
                lesson__in=required_lessons,
                is_completed=True
            ).count()

            # If the student hasn't completed every lesson, the course is NOT complete
            if completed_lessons_count < total_lessons:
                return False

        # --- 2. Check Mandatory Quiz Completion (Example) ---
        # NOTE: You need to define which quizzes are 'mandatory' in your 'quizzes' app.
        # This example assumes mandatory quizzes are linked to the course and must be passed.
        mandatory_quizzes = Quiz.objects.filter(
            course=course,
            is_mandatory=True # Assumes this field exists on the Quiz model
        )
        
        for quiz in mandatory_quizzes:
            # Check for at least one passing attempt
            passed_attempts = QuizAttempt.objects.filter(
                student=user,
                quiz=quiz,
                is_passed=True
            ).exists()
            
            if not passed_attempts:
                return False

        # If all lesson and quiz checks passed, the course is complete
        return True

    @staticmethod
    def calculate_completion_percentage(user, course_id):
        """
        Calculates the percentage of course content completed (e.g., lessons + quizzes).
        """
        # NOTE: Implementation depends heavily on how content is weighted.
        # Simple example: (Completed Lessons + Passed Quizzes) / (Total Lessons + Total Quizzes)
        
        # Placeholder for complex calculation service:
        # Should update CourseProgress.completion_percentage
        return 0.00 # Placeholder