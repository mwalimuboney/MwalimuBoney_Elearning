// src/app/instructor/services/exam-manager.service.ts (Conceptual)

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Define core interfaces (matching Django models/serializers)
interface Exam {
  id?: number;
  title: string;
  course: number;
  start_time: string; // ISO 8601 string
  duration_minutes: number;
  is_realtime: boolean; // Corresponds to your "practice test" logic
  show_score_immediately: boolean;
  questions?: Question[]; // Nested questions array
}

interface Question {
  id?: number;
  exam?: number; // Parent Exam ID
  text: string;
  question_type: 'MCQ' | 'TEXT';
  options: any[] | null; // JSON list of options for MCQs
  correct_answer: string;
  points: number;
}

@Injectable({
  providedIn: 'root'
})
export class ExamManagerService {
  private apiUrl = 'http://localhost:8000/api/';

  constructor(private http: HttpClient) { }

  // --- Exam CRUD (Parent Object) ---

  /** Endpoint: GET /api/exams/{id}/ */
  getExam(id: number): Observable<Exam> {
    return this.http.get<Exam>(`${this.apiUrl}exams/${id}/`);
  }

  /** Endpoint: POST /api/exams/ */
  createExam(examData: Exam): Observable<Exam> {
    // Note: The API must return the created Exam object including its new ID.
    return this.http.post<Exam>(`${this.apiUrl}exams/`, examData);
  }

  /** Endpoint: PATCH /api/exams/{id}/ */
  updateExam(id: number, data: Partial<Exam>): Observable<Exam> {
    return this.http.patch<Exam>(`${this.apiUrl}exams/${id}/`, data);
  }

  // --- Question CRUD (Nested Objects) ---

  /** Endpoint: GET /api/exams/{id}/questions/ (via @action in Django) */
  getQuestionsByExam(examId: number): Observable<Question[]> {
    return this.http.get<Question[]>(`${this.apiUrl}exams/${examId}/questions/`);
  }

  /** Endpoint: POST /api/questions/ (Needs a QuestionViewSet for direct POST) */
  // We'll assume a dedicated QuestionViewSet is available for direct CRUD on questions
  createQuestion(questionData: Question): Observable<Question> {
    return this.http.post<Question>(`${this.apiUrl}questions/`, questionData);
  }

  /** Endpoint: PATCH /api/questions/{id}/ */
  updateQuestion(id: number, data: Partial<Question>): Observable<Question> {
    return this.http.patch<Question>(`${this.apiUrl}questions/${id}/`, data);
  }

  /** Endpoint: DELETE /api/questions/{id}/ */
  deleteQuestion(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}questions/${id}/`);
  }
}
