import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';

import { HttpClient, HttpParams } from '@angular/common/http';
@Injectable({
  providedIn: 'root',
})
export class Search {
  private apiUrl = 'http://localhost:8000/api'; // Base API URL

  
  
}

// src/app/core/auth/auth.service.ts (Modification)

// ... existing imports

@Injectable({ providedIn: 'root' })
export class AuthService {
    private apiUrl = 'http://localhost:8000';
    constructor(private http: HttpClient) {}
      searchAdminData(query: string): Observable<any[]> {
    // Example: Searching Users, Courses, and Exams
        return this.http.get<any[]>(`${this.apiUrl}/search/admin/users/?q=${query}`);
}

    /**
     * Checks if a given field value (username, email, or phone) already exists in the database.
     * @param field The field name to check ('username', 'email', or 'phoneNumber').
     * @param value The value to check for existence.
     */
    checkUniqueness(field: string, value: string): Observable<{ exists: boolean }> {
        // Construct the query string for the new API endpoint
        const params = new HttpParams()
            .set('field', field)
            .set('value', value);
            
        // Note: This endpoint should be public, so it doesn't need the TokenInterceptor.
        return this.http.get<{ exists: boolean }>(
            `${this.apiUrl}/auth/check_unique/`, 
            { params: params }
        );
    }
    // src/app/core/services/search.service.ts
    searchAdminData(query: string): Observable<any[]> {
    // Example: Searching Users, Courses, and Exams
      return this.http.get<any[]>(`${this.apiUrl}/search/admin/users/?q=${query}`);
    }

    // ... existing login, logout, fetchUserProfile methods
}
