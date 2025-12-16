// src/app/core/auth/auth.service.ts (Refined)

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, of, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

interface AuthResponse {
  access: string;
  refresh: string;
}

interface UserProfile {
  username: string;
  // This role field is CRITICAL and must match your Django payload
  role: 'STUDENT' | 'TEACHER' | 'ADMINISTRATOR'; 
  // ... other fields
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8000';
  private userRoleSubject = new BehaviorSubject<UserProfile | null>(null);
  public userProfile$ = this.userRoleSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) { 
    // Load profile on app start if tokens exist
    this.loadUserProfile();
  }

  // --- Token Management ---

  private setTokens(response: AuthResponse): void {
    localStorage.setItem('access_token', response.access);
    localStorage.setItem('refresh_token', response.refresh);
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }
  
  // --- Authentication Flow ---

  login(credentials: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/jwt/create/`, credentials).pipe(
      tap(response => {
        this.setTokens(response);
        // Immediately fetch profile after token acquisition
        this.fetchUserProfile().subscribe(); 
      })
    );
  }

  logout(): void {
    localStorage.clear();
    this.userRoleSubject.next(null);
    this.router.navigate(['/login']);
  }
  
  // --- Role and Authorization Check ---

  fetchUserProfile(): Observable<UserProfile> {
    // Requires the JWT to be sent (handled by the Interceptor)
    return this.http.get<UserProfile>(`${this.apiUrl}/auth/users/me/`).pipe(
      tap(user => {
        this.userRoleSubject.next(user);
      })
    );
  }

  loadUserProfile(): void {
    if (this.getAccessToken() && !this.userRoleSubject.value) {
      this.fetchUserProfile().subscribe({
        error: () => this.logout() // Log out if token is invalid
      });
    }
  }

  isInstructor(): Observable<boolean> {
    // Wait for the profile to load or check the current value
    return this.userProfile$.pipe(
      tap(profile => {
        if (!profile) return false;
        const isInstructor = profile.role === 'TEACHER' || profile.role === 'ADMINISTRATOR';
        
        // If logged in but NOT an instructor, redirect them to the student app (or error page)
        if (!isInstructor && this.router.url.startsWith('/instructor')) {
             console.warn("Unauthorized access attempt. Redirecting.");
             this.router.navigate(['/']); // Redirect to the React app domain base
        }
        return isInstructor;
      })
    );
  }
}