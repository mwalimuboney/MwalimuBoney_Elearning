# reports/services.py (New App)

from django.db.models import Sum, F, DecimalField, OuterRef, Subquery
from users.models import User, UserProfile
from assessment.models import UserAttempt, Exam
from courses.models import ManualGrade # For teacher-assigned grades
from school.models import School, Class
from django.db import connection

class ReportGeneratorService:
    """Handles the aggregation of student grades and calculation of rankings."""

    def __init__(self, school: School):
        self.school = school

    def generate_report_data(self, student_user_id: int, time_period_start: str, time_period_end: str):
        """
        Aggregates all grades (automated and manual) for a student within a school
        and calculates their class and school ranks.
        """
        
        # 1. Base Data Aggregation (Fetch scores for all students in the school)
        # We join all grading sources (Attempts, Manual Grades) to get total score per student.
        
        # --- Total Scores Subquery (Simplified for concept) ---
        # In a real system, this would be a complex union/join of UserAttempt and ManualGrade
        # filtered by date and school, returning {user_id, total_score}.
        
        # For simplicity, let's assume a simplified calculation of total points earned:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    T1.user_id, 
                    SUM(T1.score) AS total_score,
                    T3.class_id
                FROM assessment_userattempt T1
                JOIN users_userprofile T2 ON T1.user_id = T2.user_id
                JOIN schools_class T3 ON T2.current_class_id = T3.id
                WHERE 
                    T2.school_id = %s AND 
                    T1.completed_at BETWEEN %s AND %s
                GROUP BY T1.user_id, T3.class_id
                ORDER BY total_score DESC;
            """, [self.school.id, time_period_start, time_period_end])
            
            raw_scores = cursor.fetchall()

        # 2. Calculate Ranking (Using Python for clarity, SQL window functions are better in production)
        
        student_data = []
        school_rank_counter = 0
        current_rank_score = -1
        
        # Calculate School Rank
        for i, (user_id, score, class_id) in enumerate(raw_scores):
            # Assign rank based on score tie-breaking
            if score < current_rank_score or current_rank_score == -1:
                school_rank_counter = i + 1
                current_rank_score = score
            
            student_data.append({
                'user_id': user_id,
                'total_score': score,
                'class_id': class_id,
                'school_rank': school_rank_counter
            })
            
        # 3. Calculate Class Rank (Group by class and rank within the group)
        class_rank_data = {}
        for data in student_data:
            class_id = data['class_id']
            if class_id not in class_rank_data:
                class_rank_data[class_id] = []
            class_rank_data[class_id].append(data)
            
        for class_id, students in class_rank_data.items():
            # Students are already sorted by score (from step 2)
            class_rank_counter = 0
            current_rank_score = -1
            
            for i, student in enumerate(students):
                 if student['total_score'] < current_rank_score or current_rank_score == -1:
                    class_rank_counter = i + 1
                    current_rank_score = student['total_score']
                 
                 student['class_rank'] = class_rank_counter
        
        # 4. Final Result Compilation
        
        target_data = next((d for d in student_data if d['user_id'] == student_user_id), None)

        if not target_data:
            return None # Student has no data for the period

        # Enrich with profile info, course details, teacher feedback, etc.
        report_context = {
            'student': User.objects.get(id=student_user_id),
            'school': self.school,
            'class': Class.objects.get(id=target_data['class_id']),
            'time_period': f"{time_period_start} to {time_period_end}",
            'metrics': {
                'total_score': target_data['total_score'],
                'class_rank': target_data['class_rank'],
                'school_rank': target_data
            },
            # Detailed breakdown of scores per course/subject
            'breakdown': self._get_detailed_breakdown(student_user_id, time_period_start, time_period_end),
        }
        
        return report_context

    # Private method to fetch score details per subject/course
    def _get_detailed_breakdown(self, student_user_id, start, end):
        # Implementation to query grades grouped by Course/Subject
        return []