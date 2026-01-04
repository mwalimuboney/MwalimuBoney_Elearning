// src/app/instructor/services/resource.service.ts (Conceptual)

import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { Observable } from 'rxjs';

// Assume a Django Resource model structure
interface Resource {
  id?: number;
  title: string;
  file?: File; // For frontend use, not directly in PATCH payload
  file_url?: string; // URL to the hosted file (read-only)
  course: number;
  uploaded_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ResourceService {
  private apiUrl = 'http://localhost:8000/api/';

  constructor(private http: HttpClient) { }

  /**
   * 1. Handles File Upload (Requires FormData and custom options)
   * Endpoint: POST /api/resources/
   */
  uploadResource(resourceData: { title: string, courseId: number, file: File }): Observable<any> {
    const formData = new FormData();
    formData.append('title', resourceData.title);
    formData.append('course', resourceData.courseId.toString());
    formData.append('file', resourceData.file, resourceData.file.name);
    
    // Set observe: 'events' to track upload progress (important for large files)
    return this.http.post(`${this.apiUrl}resources/`, formData, {
      reportProgress: true,
      observe: 'events', 
    });
  }

  /**
   * 2. Fetches resources attached to a course.
   * Endpoint: GET /api/resources/?course={courseId}
   */
  getResourcesByCourse(courseId: number): Observable<Resource[]> {
    return this.http.get<Resource[]>(`${this.apiUrl}resources/?course=${courseId}`);
  }

  /**
   * 3. Updates the resource metadata (e.g., title).
   * Endpoint: PATCH /api/resources/{id}/
   */
  updateResourceMetadata(id: number, data: Partial<Resource>): Observable<Resource> {
    // Note: Use a regular JSON PATCH here, not FormData, unless updating the file itself
    return this.http.patch<Resource>(`${this.apiUrl}resources/${id}/`, data);
  }

  /**
   * 4. Deletes a resource.
   * Endpoint: DELETE /api/resources/{id}/
   */
  deleteResource(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}resources/${id}/`);
  }
}