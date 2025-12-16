// src/app/instructor/services/announcement.service.ts (Conceptual)

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Define the Announcement interface based on your Django model
interface Announcement {
  id?: number;
  teacher?: number; // Auto-filled by Django
  teacher_username?: string; // Read-only
  title: string;
  content: string;
  is_global: boolean;
  course: number | null; // Nullable if global
  link_url: string | null; // Nullable
  posted_at?: string; // Read-only
}

@Injectable({
  providedIn: 'root'
})
export class AnnouncementService {
  private apiUrl = 'http://localhost:8000/api/'; // Base API URL

  constructor(private http: HttpClient) { }

  // --- Instructor/Admin CRUD Endpoints ---

  /**
   * Fetches all announcements the current instructor has posted.
   * Endpoint: GET /api/announcements/
   */
  getInstructorAnnouncements(): Observable<Announcement[]> {
    // Note: You may need a custom filter on the Django side if this list is too large.
    return this.http.get<Announcement[]>(`${this.apiUrl}announcements/`);
  }

  /**
   * Creates a new announcement (Global or Course-specific).
   * Endpoint: POST /api/announcements/
   */
  createAnnouncement(data: Announcement): Observable<Announcement> {
    // Ensure course is null if is_global is true, to match Django model constraints
    if (data.is_global) {
      data.course = null;
    }
    return this.http.post<Announcement>(`${this.apiUrl}announcements/`, data);
  }
  
  /**
   * Updates an existing announcement.
   * Endpoint: PATCH /api/announcements/{id}/
   */
  updateAnnouncement(id: number, data: Partial<Announcement>): Observable<Announcement> {
    return this.http.patch<Announcement>(`${this.apiUrl}announcements/${id}/`, data);
  }

  /**
   * Deletes an announcement.
   * Endpoint: DELETE /api/announcements/{id}/
   */
  deleteAnnouncement(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}announcements/${id}/`);
  }
  
  // --- Student/Public Feed Endpoint (Optional, if not handled by Student Service) ---
  
  /**
   * Fetches the student's personalized feed (global + enrolled courses).
   * This would typically be called by the React frontend, but included here for completeness.
   * Endpoint: GET /api/announcements/
   */
  getStudentFeed(): Observable<Announcement[]> {
    return this.http.get<Announcement[]>(`${this.apiUrl}announcements/`);
  }
}
