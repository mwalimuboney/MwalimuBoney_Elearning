// src/app/app-routing.module.ts (Example)

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './core/auth/login/login.component';
import { RoleGuard } from './core/auth/guards/role.guard';
import { CourseEditorComponent } from './instructor/course-editor/course-editor';
import { CourseManagerComponent } from './instructor/course-manager/course-manager/course-manager';

// Import your instructor components
// ...

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  
  // --- PROTECTED INSTRUCTOR ROUTES ---
  {
    path: 'instructor',
    canActivate: [RoleGuard], // <<< This protects the entire segment
    children: [
      { path: 'dashboard', component: DashboardHomeComponent },
      { path: 'courses', component: CourseManagerComponent },
      { path: 'courses/:id/edit', component: CourseEditorComponent },
      // ... all other instructor routes (grades, exams, etc.)
    ]
  },
   {
    path: 'instructor', // When the URL is /instructor
    loadChildren: () => import('./instructor/instructor.module').then(m => m.InstructorModule) // Load the module lazily
  },

  { path: '', redirectTo: 'login', pathMatch: 'full' }, // Redirect root to login (or a landing page)
  { path: '**', redirectTo: 'login' }, 
  


];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }