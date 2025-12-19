import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, of } from 'rxjs';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { map, catchError, tap } from 'rxjs/operators';
import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8000/api';
  private userRoleSubject = new BehaviorSubject<any | null>(null);
  public userProfile$ = this.userRoleSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.loadUserProfile();
    }
  }

  // --- Registration ---
  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register/`, userData).pipe(
      catchError(this.handleError)
    );
  }

  // --- Uniqueness Check (API Call) ---
  checkUniqueValue(field: string, value: string): Observable<boolean> {
    return this.http.post<{ isAvailable: boolean }>(`${this.apiUrl}/auth/check-unique/`, {
      field: field,
      value: value
    }).pipe(
      map(res => res.isAvailable),
      catchError(() => of(true)) 
    );
  }

  // --- Profile Management ---
  fetchUserProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/auth/users/me/`).pipe(
      tap(user => this.userRoleSubject.next(user)),
      catchError(err => {
        this.logout();
        return throwError(() => err);
      })
    );
  }

  loadUserProfile(): void {
    const token = this.getAccessToken();
    if (token && !this.userRoleSubject.value) {
      this.fetchUserProfile().subscribe();
    }
  }

  getAccessToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('access_token');
    }
    return null;
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.clear();
    }
    this.userRoleSubject.next(null);
    this.router.navigate(['/login']);
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = error.error; 
    }
    return throwError(() => errorMessage);
  }
}

/**
 * STANDALONE ASYNC VALIDATOR FUNCTION
 * This stays OUTSIDE the AuthService class.
 */
export function uniqueCheckValidator(authService: AuthService, field: string): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (!control.value) return of(null);

    return authService.checkUniqueValue(field, control.value).pipe(
      map(isAvailable => (isAvailable ? null : { notUnique: true })),
      catchError(() => of(null))
    );
  };
}