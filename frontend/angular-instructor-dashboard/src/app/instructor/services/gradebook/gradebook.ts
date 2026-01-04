import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Define the core data interfaces for strong typing (must match Django Serializers)
interface ManualGrade {
  id?: number;
  student: number;
  course: number;
  assignment_name: string;
  score: number;
  max_score: number;
  student_username?: string; // read-only field
}

interface LearningProgress {
  user: number;
  user_profile: { username: string; role: string };
  average_assessment_score: number;
  total_assessments_taken: number;
  // ... other fields from your LearningProgress model
}

@Injectable({
  providedIn: 'root'
})
export class Gradebook {
  private apiUrl = 'http://localhost:8000/api/'; // Base API URL

  constructor(private http: HttpClient) { }

  // --- Grade Management (CRUD for ManualGradeViewSet) ---

  /**
   * Fetches all ManualGrades for a specific course, used to populate the editor.
   * Assumes the backend will filter based on the teacher's ownership/association.
   * Endpoint: GET /api/grades/?course={courseId}
   */
  getGradesByCourse(courseId: number): Observable<ManualGrade[]> {
    return this.http.get<ManualGrade[]>(`${this.apiUrl}grades/?course=${courseId}`);
  }

  /**
   * Creates a new ManualGrade entry.
   * Endpoint: POST /api/grades/
   */
  createGrade(gradeData: ManualGrade): Observable<ManualGrade> {
    return this.http.post<ManualGrade>(`${this.apiUrl}grades/`, gradeData);
  }

  /**
   * Updates an existing ManualGrade entry (used for inline editing).
   * Endpoint: PATCH /api/grades/{id}/
   */
  updateGrade(gradeId: number, data: Partial<ManualGrade>): Observable<ManualGrade> {
    return this.http.patch<ManualGrade>(`${this.apiUrl}grades/${gradeId}/`, data);
  }

  // --- Reporting & Progress Data (LearningProgressReadOnlyViewSet) ---

  /**
   * Fetches aggregated performance data for students.
   * Endpoint: GET /api/progress/ (Backend filters by role/course)
   */
  getCoursePerformanceReport(): Observable<LearningProgress[]> {
    // NOTE: This call will return ALL student data if the logged-in user is a Teacher/Admin,
    // filtered down to relevant courses on the server side.
    return this.http.get<LearningProgress[]>(`${this.apiUrl}progress/`);
  }
}