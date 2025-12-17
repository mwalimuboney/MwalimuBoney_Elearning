// src/app/instructor/services/messaging.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TeacherClass } from './class'; // Re-use the TeacherClass interface

@Injectable({ providedIn: 'root' })
export class MessagingService {
  private apiUrl = 'http://localhost:8000/api';
  private announcementEndpoint = `${this.apiUrl}/communications/announcements/`;

  constructor(private http: HttpClient) { }

  /**
   * Fetches classes the teacher is associated with (used for targeted messaging).
   */
  getTeacherTargetClasses(): Observable<TeacherClass[]> {
    // Re-use an existing endpoint or create a new one to list classes owned by the user
    return this.http.get<TeacherClass[]>(`${this.apiUrl}/classes/my_classes/`); 
  }

  /**
   * Sends a message to the backend using the scoped API endpoint.
   * @param payload The full payload including scope, content, and targets.
   */
  sendScopedMessage(payload: any): Observable<any> {
    return this.http.post(`${this.announcementEndpoint}send-scoped/`, payload);
  }
}