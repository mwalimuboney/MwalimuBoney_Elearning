// src/app/instructor/services/course.service.ts (Conceptual)

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// --- Data Interfaces (Matching Django Serializers) ---

interface Lesson {
  id?: number;
  course: number; // Foreign Key to the parent course
  title: string;
  content: string; // The lesson body (HTML/markdown content)
  order: number; // For sequencing lessons
}

interface Course {
  id?: number;
  title: string;
  description: string;
  category?: string; // If you have a category field
  lessons: Lesson[]; // Nested lessons (often read-only on the course endpoint)
  is_published: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private apiUrl = 'http://localhost:8000/api/'; // Base API URL

  constructor(private http: HttpClient) { }

  // --- Course CRUD (courses/CourseViewSet) ---

  /**
   * Fetches all courses (Instructor's view).
   * Endpoint: GET /api/courses/
   */
  getCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.apiUrl}courses/`);
  }

  /**
   * Fetches a single course detail.
   * Endpoint: GET /api/courses/{id}/
   */
  getCourse(id: number): Observable<Course> {
    return this.http.get<Course>(`${this.apiUrl}courses/${id}/`);
  }

  /**
   * Creates a new course.
   * Endpoint: POST /api/courses/
   */
  createCourse(courseData: Partial<Course>): Observable<Course> {
    return this.http.post<Course>(`${this.apiUrl}courses/`, courseData);
  }

  /**
   * Updates an existing course (e.g., changing title, description, or publishing status).
   * Endpoint: PATCH /api/courses/{id}/
   */
  updateCourse(id: number, data: Partial<Course>): Observable<Course> {
    return this.http.patch<Course>(`${this.apiUrl}courses/${id}/`, data);
  }

  /**
   * Deletes a course.
   * Endpoint: DELETE /api/courses/{id}/
   */
  deleteCourse(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}courses/${id}/`);
  }

  // --- Lesson Management (courses/LessonViewSet) ---

  /**
   * Fetches lessons for a specific course (using the query parameter filter).
   * Endpoint: GET /api/lessons/?course={courseId}
   */
  getLessonsByCourse(courseId: number): Observable<Lesson[]> {
    return this.http.get<Lesson[]>(`${this.apiUrl}lessons/?course=${courseId}`);
  }

  /**
   * Creates a new lesson linked to a course.
   * Endpoint: POST /api/lessons/
   */
  createLesson(lessonData: Lesson): Observable<Lesson> {
    return this.http.post<Lesson>(`${this.apiUrl}lessons/`, lessonData);
  }

  /**
   * Updates an existing lesson (crucial for reordering or content changes).
   * Endpoint: PATCH /api/lessons/{id}/
   */
  updateLesson(id: number, data: Partial<Lesson>): Observable<Lesson> {
    return this.http.patch<Lesson>(`${this.apiUrl}lessons/${id}/`, data);
  }

  /**
   * Deletes a lesson.
   * Endpoint: DELETE /api/lessons/{id}/
   */
  deleteLesson(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}lessons/${id}/`);
  }
}

// src/app/instructor/services/course.service.ts (Additions)

// Define structures for nested content
urn this.http.post<Resource>(`${this.courseEndpoint}resources/`, formData);
  }




// // src/app/instructor/services/course.service.ts

// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable } from 'rxjs';

// // Define the core data structure (Must match Django's Course model)
// export interface Course {
//   id: number;
//   title: string;
//   description: string;
//   is_published: boolean;
//   created_at: Date;
//   updated_at: Date;
//   // Nested lists will be fetched separately or included in detail view
//   lessons: any[]; 
//   resources: any[];
// }

// @Injectable({ providedIn: 'root' })
// export class CourseService {
//   // Use the API URL base
//   private apiUrl = 'http://localhost:8000/api'; 
//   private courseEndpoint = `${this.apiUrl}/courses/`;

//   constructor(private http: HttpClient) { }

//   /**
//    * GET: Retrieves all courses created by the current instructor (via JWT scope).
//    * @returns Observable<Course[]>
//    */
//   getCourses(): Observable<Course[]> {
//     // The backend endpoint GET /api/courses/ should automatically filter by the logged-in instructor
//    
// export interface Lesson {
//   id?: number; // Optional for new lessons
//   course_id: number;
//   title: string;
//   order: number;
//   resources: Resource[]; // List of files/links within the lesson
// }

// export interface Resource {
//     id?: number;
//     lesson_id: number;
//     title: string;
//     file?: File; // For uploading new files
//     file_url?: string; // For existing file display
//     antivirus_status?: 'CLEAN' | 'PENDING' | 'INFECTED';
// }

// // ... inside CourseService class ...

//   // LESSON MANAGEMENT
//   createLesson(lessonData: Partial<Lesson>): Observable<Lesson> {
//     return this.http.post<Lesson>(`${this.courseEndpoint}lessons/`, lessonData);
//   }
//   updateLesson(lessonId: number, data: Partial<Lesson>): Observable<Lesson> {
//     return this.http.patch<Lesson>(`${this.apiUrl}/lessons/${lessonId}/`, data);
//   }
//   deleteLesson(lessonId: number): Observable<any> {
//     return this.http.delete(`${this.apiUrl}/lessons/${lessonId}/`);
//   }
  
//   // RESOURCE MANAGEMENT (Handles Antivirus File Upload)
//   uploadResource(lessonId: number, title: string, file: File): Observable<Resource> {
//     const formData = new FormData();
//     formData.append('lesson_id', lessonId.toString());
//     formData.append('title', title);
//     // 'file' must match the field name in the Django ResourceSerializer
//     formData.append('file', file, file.name); 

//     // The backend AntivirusValidator will execute on this POST request.
//     ret return this.http.get<Course[]>(this.courseEndpoint);
// //   }

//   /**
//    * GET: Retrieves details for a single course.
//    * @param id The course ID.
//    * @returns Observable<Course>
//    */
//   getCourse(id: number): Observable<Course> {
//     return this.http.get<Course>(`${this.courseEndpoint}${id}/`);
//   }

//   /**
//    * POST: Creates a new course.
//    * @param data Partial Course data (title, description).
//    * @returns Observable<Course>
//    */
//   createCourse(data: Partial<Course>): Observable<Course> {
//     return this.http.post<Course>(this.courseEndpoint, data);
//   }

//   /**
//    * PATCH: Updates existing course details (used for edit and publishing toggle).
//    * @param id The course ID.
//    * @param data The updated fields.
//    * @returns Observable<Course>
//    */
//   updateCourse(id: number, data: Partial<Course>): Observable<Course> {
//     return this.http.patch<Course>(`${this.courseEndpoint}${id}/`, data);
//   }

//   /**
//    * DELETE: Deletes a course permanently.
//    * @param id The course ID.
//    * @returns Observable<any>
//    */
//   deleteCourse(id: number): Observable<any> {
//     return this.http.delete(`${this.courseEndpoint}${id}/`);
//   }
// }