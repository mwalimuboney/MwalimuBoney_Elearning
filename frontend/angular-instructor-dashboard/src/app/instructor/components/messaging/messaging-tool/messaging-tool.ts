
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessagingService } from '../../../services/messaging';
import { TeacherClass } from '../../../services/class';
import { AuthService } from '../../../../core/auth/auth'; // To get user role
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { MatDialog } from '@angular/material/dialog';
// import { AdminUser } from '../../../admin/admin-users';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { MatCard, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle } from '@angular/material/card';
import { UserRole } from '../../../../core/role';
import { MatOption } from '@angular/material/select';
import { MatProgressSpinner } from '@angular/material/progress-spinner';


@Component({
  selector: 'app-messaging-tool',
  templateUrl: './messaging-tool.html',
  styleUrls: ['./messaging-tool.css'],
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
    MatCard,
    MatOption,
    MatCardHeader,
    MatCardSubtitle,
    MatCardTitle,
    MatCardContent,
    MatProgressSpinner,
    
    
  ]
})


export class MessagingToolComponent implements OnInit {

  messageForm!: FormGroup;
  isSubmitting: boolean = false;
  isTeacher: boolean = false;
  isAdmin: boolean = false;
  
  teacherClasses$!: Observable<TeacherClass[]>;
  
  // Available Scope Options (Admins see all, Teachers see subset)
  SCOPE_OPTIONS: { value: string, label: string }[] = [
    { value: 'SCHOOL_INTERNAL', label: 'My School: Internal Announcement' },
    { value: 'CLASS', label: 'Specific Class' },
    { value: 'USER', label: 'Specific User (Student/Parent/Teacher)' },
  ];


  
  constructor(
    private fb: FormBuilder,
    private messagingService: MessagingService,
    private authService: AuthService
  ) {
    // Check roles immediately upon component construction
    this.isTeacher = this.authService.UserRole === 'TEACHER';
    this.isAdmin = this.authService.UserRole === 'ADMINISTRATOR';

    if (this.isAdmin) {
      // Admins get the highest privilege option
      this.SCOPE_OPTIONS.unshift({ value: 'GLOBAL_PUBLIC', label: 'Global: Public Announcement (All Schools)' });
    }
  }

  ngOnInit(): void {
    this.messageForm = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required],
      scope_type: [this.isAdmin ? 'GLOBAL_PUBLIC' : 'SCHOOL_INTERNAL', Validators.required],
      target_id: [null], // Used for classId or userId
      is_notification: [true] // Flag for triggering external notifications
    });
    
    // Load class targets if the user is a teacher or admin
    if (this.isTeacher || this.isAdmin) {
      this.teacherClasses$ = this.messagingService.getTeacherTargetClasses();
    }
    
    // Subscribe to scope changes to conditionally require target_id
    this.messageForm.get('scope_type')?.valueChanges.pipe(
      tap(scope => this.handleScopeChange(scope))
    ).subscribe();


  // Subscribe to the stream provided by AuthService
  this.authService.userProfile$.subscribe({
    next: (profile) => {
      if (profile) {
        // Use the Enum imported at the top for comparison
        this.isTeacher = profile.role === UserRole.Teacher;
        this.isAdmin = profile.role === UserRole.Administrator || 
                       profile.role === UserRole.SuperAdmin;

        if (this.isAdmin) {
          this.addAdminScopeOptions();
        }
        
        if (this.isTeacher || this.isAdmin) {
          this.teacherClasses$ = this.messagingService.getTeacherTargetClasses();
        }
      }
    }
  });
}

private addAdminScopeOptions() {
  const hasGlobal = this.SCOPE_OPTIONS.some(o => o.value === 'GLOBAL_PUBLIC');
  if (!hasGlobal) {
    this.SCOPE_OPTIONS.unshift({ 
      value: 'GLOBAL_PUBLIC', 
      label: 'Global: Public Announcement (All Schools)' 
    });
  }
}
  
  
  /**
   * Adjusts validation and UI based on the selected scope.
   */
  handleScopeChange(scope: string): void {
    const targetControl = this.messageForm.get('target_id');
    
    // Scopes that require a specific target ID (Class or User)
    if (scope === 'CLASS' || scope === 'USER') {
      targetControl?.setValidators(Validators.required);
    } else {
      // Scopes that target a wide group (School Internal, Global Public) don't need a specific ID
      targetControl?.clearValidators();
      targetControl?.setValue(null);
    }
    targetControl?.updateValueAndValidity();
  }

  /**
   * Handles form submission to send the message via API.
   */
  onSubmit(): void {
    if (this.messageForm.invalid) {
      alert('Please fill out all required fields.');
      this.messageForm.markAllAsTouched();
      return;
    }
    
    this.isSubmitting = true;
    
    this.messagingService.sendScopedMessage(this.messageForm.value).subscribe({
      next: (response) => {
        alert('Message sent successfully! Notifications are being processed.');
        this.messageForm.reset({ 
            scope_type: this.isAdmin ? 'GLOBAL_PUBLIC' : 'SCHOOL_INTERNAL',
            is_notification: true
        });
      },
      error: (err) => {
        console.error('Messaging failed:', err);
        alert(`Failed to send message: ${err.error?.detail || 'Server error.'}`);
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }
}