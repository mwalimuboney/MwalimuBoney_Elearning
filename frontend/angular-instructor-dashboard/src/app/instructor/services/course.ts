import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * --- DATA MODELS ---
 * These interfaces precisely match the nested structure 
 * of your Django REST Framework serializers.
 */

export interface Resource {
  id?: number;
  lesson_id: number;
  title: string;
  file?: File;                // Used for frontend uploads
  file_url?: string;          // Returned by Django/S3/Cloudinary
  antivirus_status?: 'CLEAN' | 'PENDING' | 'INFECTED';
}

export interface Lesson {
  id: number;
  course_id: number;
  title: string;
  summary?: string;
  content?: string;           // Supports HTML/Markdown
  is_preview: boolean;
  order: number;
  resources?: Resource[];     // Nested resources
}

export interface Course {
  id: number;
  title: string;
  description: string;
  category?: string;
  course_image_url?: string;
  duration_hours?: number;
  price?: number;
  is_published: boolean;
  lesson_count?: number;      // Calculated by Django
  enrollment_count?: number;  // Calculated by Django
  lessons?: Lesson[];         // Nested lessons
  created_at?: Date;
  updated_at?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  // Centralized API configuration
  private readonly baseUrl = 'http://localhost:8000/api'; 
  private readonly courseUrl = `${this.baseUrl}/courses/`;

  constructor(private http: HttpClient) { }

  // --- COURSE OPERATIONS ---

  /** Fetches all courses (typically filtered by Instructor in Backend via JWT) */
  getCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(this.courseUrl);
  }

  /** Fetches full detail of one course including nested lessons */
  getCourse(id: number): Observable<Course> {
    return this.http.get<Course>(`${this.courseUrl}${id}/`);
  }

  createCourse(data: Partial<Course>): Observable<Course> {
    return this.http.post<Course>(this.courseUrl, data);
  }

  updateCourse(id: number, data: Partial<Course>): Observable<Course> {
    return this.http.patch<Course>(`${this.courseUrl}${id}/`, data);
  }

  deleteCourse(id: number): Observable<any> {
    return this.http.delete(`${this.courseUrl}${id}/`);
  }

  // --- LESSON OPERATIONS ---

  /** Fetches lessons specifically for a course ID if not using nested serializers */
  getLessonsByCourse(courseId: number): Observable<Lesson[]> {
    return this.http.get<Lesson[]>(`${this.baseUrl}/lessons/?course=${courseId}`);
  }

  createLesson(data: Partial<Lesson>): Observable<Lesson> {
    // Note: Django usually expects 'course' (ID) in the payload
    return this.http.post<Lesson>(`${this.baseUrl}/lessons/`, data);
  }

  updateLesson(id: number, data: Partial<Lesson>): Observable<Lesson> {
    return this.http.patch<Lesson>(`${this.baseUrl}/lessons/${id}/`, data);
  }

  deleteLesson(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/lessons/${id}/`);
  }

  // --- RESOURCE & FILE MANAGEMENT ---

  /**
   * Uploads a file using FormData.
   * This allows Django to receive the physical file and initiate the antivirus scan.
   */
  uploadResource(lessonId: number, title: string, file: File): Observable<Resource> {
    const formData = new FormData();
    formData.append('lesson_id', lessonId.toString());
    formData.append('title', title);
    formData.append('file', file, file.name);

    return this.http.post<Resource>(`${this.baseUrl}/resources/`, formData);
  }
}