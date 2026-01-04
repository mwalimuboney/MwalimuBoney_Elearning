import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../auth';
import { UserRole } from '../../role'; // 1. Import your new Enum

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {

    return this.authService.userProfile$.pipe(
      take(1), 
      map(profile => {
        // 1. Basic Auth Check
        if (!profile) {
          return this.router.createUrlTree(['/login']);
        }

        // 2. Global "Super Admin" Bypass (Using Enum)
        // This clears the ts(2367) error because both sides are now UserRole type
        if (profile.role === UserRole.SuperAdmin) {
          return true;
        }

        // 3. Dynamic Role Check
        const expectedRole = route.data['expectedRole'];
        if (expectedRole && profile.role === expectedRole) {
          return true;
        }

        // 4. Staff Check (Using Enum for safety)
        const isStaff = [
          UserRole.Teacher,
          UserRole.Administrator,
          UserRole.SchoolAdmin,
          UserRole.DeptAdmin
        ].includes(profile.role);

        if (isStaff) {
          return true;
        }

        // 5. Access Denied
        console.warn(`Access denied for role: ${profile.role}`);
        return this.router.createUrlTree(['/']); 
      })
    );
  }
}