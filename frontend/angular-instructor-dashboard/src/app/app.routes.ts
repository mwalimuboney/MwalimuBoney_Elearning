import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './core/auth/login/login';
import { RoleGuard } from './core/auth/guards/role.guard';
import { SchoolManagerComponent } from './admin/components/school-manager/school-manager';
import { DepartmentManagementComponent } from './admin/components/department/department';
import { DashboardHomeComponent } from './dashboard/dashboard-home/dashboard-home';
import { HomeDashboardComponent } from './home-dashboard/home-dashboard';

export const routes: Routes = [
  // Dashboard home
  { path: 'home', component: HomeDashboardComponent },

  // Instructor Dashboard 
   { path: 'dashboard', component: DashboardHomeComponent },

  { path: 'login', component: LoginComponent },
  {
  path: 'register',
  loadComponent: () => import('./core/auth/registration/registration-validators/registration-validators')
    .then(m => m.RegistrationValidatorsComponent)
},
  // --- SECURE LAZY LOADING ---
  {
    path: 'instructor',
    canActivate: [RoleGuard], // Protects the entire instructor section
    // Lazy load the module. Inside InstructorModule, define the sub-paths (dashboard, courses, etc.)
    loadChildren: () => import('./instructor/instructor-routing.module').then(m => m.InstructorRoutingModule)
  },

  { path: '', redirectTo: 'home', pathMatch: 'full' },

  { path: '**', redirectTo: 'home' }, 

  {
    path: 'school-management',
    component: SchoolManagerComponent,
    canActivate: [RoleGuard],
    data: { expectedRole: 'SCHOOL_ADMIN' } // This is what route.data['expectedRole'] reads
  },
  {
    path: 'department-setup',
    component: DepartmentManagementComponent,
    canActivate: [RoleGuard],
    data: { expectedRole: 'DEPT_ADMIN' }
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }