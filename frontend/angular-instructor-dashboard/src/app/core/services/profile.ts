import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError, shareReplay } from 'rxjs/operators';
import { UserProfile } from '../role';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = 'http://127.0.0.1:8000/api/auth/users/me/';
  
  // Use a BehaviorSubject to store and broadcast the profile data
  private profileSubject = new BehaviorSubject<UserProfile | null>(null);
  
  // Public observable that components can subscribe to
  public profile$ = this.profileSubject.asObservable();

  constructor(private http: HttpClient) {
    // Automatically fetch profile if we have a token
    if (localStorage.getItem('access_token')) {
      this.fetchProfile().subscribe();
    }
  }

  /**
   * Fetches the current user profile from Django (Djoser or Custom JWT)
   */
  fetchProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(this.apiUrl).pipe(
      tap(profile => {
        console.log('Profile loaded:', profile);
        this.profileSubject.next(profile);
      }),
      catchError(err => {
        console.error('Error fetching profile:', err);
        return throwError(() => err);
      }),
      // shareReplay ensures multiple subscribers don't trigger multiple API calls
      shareReplay(1)
    );
  }

  /**
   * Updates the profile data
   */
  updateProfile(data: Partial<UserProfile>): Observable<UserProfile> {
    return this.http.patch<UserProfile>(this.apiUrl, data).pipe(
      tap(updatedProfile => this.profileSubject.next(updatedProfile))
    );
  }

  /**
   * Clear the profile (call this during logout)
   */
  clearProfile(): void {
    this.profileSubject.next(null);
  }

  /**
   * Synchronous helper to get current profile data
   */
  get currentProfileValue(): UserProfile | null {
    return this.profileSubject.value;
  }
}