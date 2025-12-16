// src/app/instructor/services/class.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Course } from './course.service'; 

// Define data structures needed for the roster
export interface ClassRosterStudent {
  id: number;
  username: string;
  email: string;
  is_enrolled: boolean; // Flag to show enrollment status
}

export interface TeacherClass {
    id: number;
    name: string;
    school_name: string;
    current_students: ClassRosterStudent[];
}


@Injectable({ providedIn: 'root' })
export class ClassService {
  private apiUrl = 'http://localhost:8000/api'; 
  private classEndpoint = `${this.apiUrl}/classes/`;

  constructor(private http: HttpClient) { }

  /**
   * GET: Retrieves all classes taught by the current teacher, including student rosters.
   * @returns Observable<TeacherClass[]>
   */
  getTeacherClasses(): Observable<TeacherClass[]> {
    // Backend logic filters classes by the logged-in user (Teacher)
    return this.http.get<TeacherClass[]>(`${this.classEndpoint}my_classes_with_roster/`);
  }

  /**
   * GET: Searches for students within the teacher's current school.
   * @param query Username or Email search string.
   * @returns Observable<ClassRosterStudent[]> (Students not currently in a class)
   */
  searchAvailableStudents(query: string): Observable<ClassRosterStudent[]> {
    // Backend API filters students by school and excludes those already in a class
    return this.http.get<ClassRosterStudent[]>(`${this.apiUrl}/users/school_students/`, {
        params: { search: query }
    });
  }

  /**
   * POST/PATCH: Adds a student to the specified class.
   * @param classId The ID of the class to enroll into.
   * @param studentId The ID of the student to enroll.
   * @returns Observable<any>
   */
  enrollStudent(classId: number, studentId: number): Observable<any> {
    // Backend updates the student's UserProfile.current_class_id
    return this.http.post(`${this.classEndpoint}${classId}/enroll/`, {
        student_id: studentId, 
        action: 'enroll'
    });
  }
  
  /**
   * POST/PATCH: Removes a student from the specified class.
   * @param classId The ID of the class to remove from.
   * @param studentId The ID of the student to remove.
   * @returns Observable<any>
   */
  unenrollStudent(classId: number, studentId: number): Observable<any> {
    return this.http.post(`${this.classEndpoint}${classId}/enroll/`, {
        student_id: studentId, 
        action: 'unenroll'
    });
  }
}