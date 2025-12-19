
import { isPlatformBrowser } from '@angular/common';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, of, BehaviorSubject, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { UserRole } from '../role'; // Adjust path as needed
import { catchError, map } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode'; // You may need: npm install jwt-decode
interface AuthResponse {
  access: string
  refresh: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user?: any;
}



export interface UserProfile {
  // ... other fields
  // CHANGE THIS LINE:
  role: UserRole; 
}
@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8000/api';
  private userRoleSubject = new BehaviorSubject<UserProfile | null>(null);
  public userProfile$ = this.userRoleSubject.asObservable();
  

  isLoggedIn = false;
  isTeacher = false;
  isAdmin = false;
  userName = 'Guest';
  greeting = '';

  // 3. Inject PLATFORM_ID in constructor
  constructor(
    private http: HttpClient, 
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object 
  ) { 
    // 4. Wrap the initial load in a browser check
    if (isPlatformBrowser(this.platformId)) {
      this.loadUserProfile();
    }
  }

// 1. Check if the user is logged in (Token exists)
 checkAuthStatus() {
  // Use 'this.' to tell TypeScript you are talking about the variable in this class
  this.isLoggedIn = this.isLoggedIn; 

  if (this.isLoggedIn) {
    const role = this.getUserRole();
    this.isTeacher = (role === 'TEACHER');
    this.isAdmin = (role === 'ADMIN');
    this.userName = this.getUserName();
  }
}


  // 2. Get the User's Role from the decoded JWT
  getUserRole(): string {
    const token = localStorage.getItem('access_token');
    if (!token) return 'GUEST';
    
    try {
      const decoded: any = jwtDecode(token);
      return decoded.role || 'STUDENT'; // Adjust 'role' to match your Django field
    } catch (e) {
      return 'GUEST';
    }
  }

   // 3. Get User Name for the Greeting
  getUserName(): string {
    const token = localStorage.getItem('access_token');
    if (!token) return 'Guest';

    try {
      const decoded: any = jwtDecode(token);
      return decoded.username || 'User'; 
    } catch (e) {
      return 'Guest';
    }
  }

  
 // --- Token Management ---

  private setTokens(response: AuthResponse): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('access_token', response.access);
      localStorage.setItem('refresh_token', response.refresh);
    }
  }
  

  getAccessToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('access_token');
    }
    return null;
  }

  checkUniqueValue(field: string, value: string): Observable<boolean> {
    // This sends a POST to your Django backend
    return this.http.post<{ isAvailable: boolean }>(`${this.apiUrl}/auth/check-unique/`, {
      field: field,
      value: value
    }).pipe(
      map(res => res.isAvailable),
      catchError(() => of(true)) // If server fails, we assume it's okay to proceed
    );
  }

  
  // --- Authentication Flow ---


login(credentials: any): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login/`, credentials).pipe(
      tap(res => {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('access_token', res.access);
          localStorage.setItem('refresh_token', res.refresh);
        }
      }),
      catchError(this.handleError)
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
  return this.userProfile$.pipe(
    map(profile => {
      // 1. If no profile, they are definitely not an instructor
      if (!profile) return false;

      // 2. Check for instructor roles (including the new Admin tiers)
      const isInstructor = 
        profile.role === UserRole.Teacher || 
        profile.role === UserRole.Administrator ||
        profile.role === UserRole.SuperAdmin ||
        profile.role === UserRole.SchoolAdmin;

      // 3. Side Effect: Redirect if they are in the wrong area
      if (!isInstructor && this.router.url.startsWith('/instructor')) {
        console.warn("Unauthorized access attempt. Redirecting.");
        this.router.navigate(['/']); 
      }

      // 4. Return the boolean result to the stream
      return isInstructor;
    })
  );
}

private handleError(error: HttpErrorResponse) {
    // We return the whole error so the component can check error.status
    return throwError(() => error);
  }


// Add a getter or method to handle the check logic centrally
getIsAdmin(role: string): boolean {
  return role === 'Administrator';
}

  get UserRole(): string | null {
    const profile = this.userRoleSubject.value;
    return profile ? profile.role : null;
}
}