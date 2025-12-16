// src/app/core/auth/guards/role.guard.ts

import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> {

    // 1. Check if the user is authenticated and has the instructor role
    return this.authService.userProfile$.pipe(
      take(1), // Complete the observable after the first emission
      map(profile => {
        // If profile hasn't loaded but token exists, AuthService handles fetch.
        if (!profile) {
            // If no profile, redirect to login
            return this.router.createUrlTree(['/login']);
        }
        
        // Check the role
        const isInstructor = profile.role === 'TEACHER' || profile.role === 'ADMINISTRATOR';

        if (isInstructor) {
          return true; // Access granted
        } else {
          // Access denied, redirect to the root (student app)
          console.warn('Access denied: User is a Student.');
          // NOTE: For a multi-domain setup, this should redirect to the root domain of the React app
          return this.router.createUrlTree(['/']); 
        }
      })
    );
  }
}