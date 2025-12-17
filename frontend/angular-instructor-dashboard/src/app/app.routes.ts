import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './core/auth/login/login';
import { RoleGuard } from './core/auth/guards/role.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  
  // --- SECURE LAZY LOADING ---
  {
    path: 'instructor',
    canActivate: [RoleGuard], // Protects the entire instructor section
    // Lazy load the module. Inside InstructorModule, define the sub-paths (dashboard, courses, etc.)
    loadChildren: () => import('./instructor/instructor-routing.module').then(m => m.InstructorRoutingModule)
  },

  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }, 
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }