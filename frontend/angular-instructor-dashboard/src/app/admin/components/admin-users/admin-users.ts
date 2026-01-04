

import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AdminUser } from '../../../admin/admin-users';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CourseService } from '../../../instructor/services/course';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { MatMenuModule} from '@angular/material/menu';


@Component({
  selector: 'app-admin-users',
  standalone: true,
  templateUrl: './admin-users.html',
  styleUrl: './admin-users.css',
  imports: [
    MatDialogModule, 
    MatFormFieldModule, 
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatSlideToggle,
    CommonModule,
    FormsModule,
    MatIcon,
    MatMenuModule
    // MatDialog
  ]
})
export class AdminUsersComponent implements OnInit {
  adminUsers: AdminUser[] = [];

  constructor(private courseService: CourseService, private dialog: MatDialog) {}

  ngOnInit() {
    this.loadAdmins();
  }

  loadAdmins() {
    this.courseService.getAdminUsers().subscribe(users => this.adminUsers = users);
  }

  getRoleClass(role: string): string {
    switch (role) {
      case 'SUPER_ADMIN': return 'bg-super';
      case 'SCHOOL_ADMIN': return 'bg-school';
      case 'DEPT_ADMIN': return 'bg-dept';
      default: return 'bg-secondary';
    }
  }

  openAddAdminDialog() {
    // We would use the same Material Dialog pattern we used for Departments here
  }
}
