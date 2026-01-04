// src/app/admin/admin-routing.module.ts

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SchoolManagerComponent } from '../admin/components/school-manager/school-manager';
import { AdminUsersComponent } from '../admin/components/admin-users/admin-users';
import { RoleGuard } from '../core/auth/guards/role.guard'; // Use existing guard

const routes: Routes = [
  { 
    path: 'schools', 
    component: SchoolManagerComponent, 
    canActivate: [RoleGuard],
    data: { roles: ['ADMINISTRATOR'] } // Only global/school admins can manage this
  },
  { 
    path: 'users', 
    component: AdminUsersComponent, 
    canActivate: [RoleGuard],
    data: { roles: ['ADMINISTRATOR'] } 
  },
  { path: '', redirectTo: 'schools', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }