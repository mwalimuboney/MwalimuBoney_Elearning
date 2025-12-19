import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AuthService } from '../auth';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  hidePassword = true;
  isLoading = false;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService // Inject your actual service here
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }
onSubmit(): void {
  if (this.loginForm.invalid) return;

  this.isLoading = true;
  this.errorMessage = null;

  this.authService.login(this.loginForm.value).subscribe({
    next: (_: any) => {
      this.isLoading = false;
      this.router.navigate(['/instructor/dashboard']);
    },
    error: (err: HttpErrorResponse) => {
      this.isLoading = false;
      
      // Check if backend is completely unreachable (status 0)
      if (err.status === 0) {
        this.errorMessage = 'The server is currently unreachable. Please check your internet or try again later.';
      } else {
        // Handle specific Django/Djoser errors
        this.errorMessage = err.error?.detail || 
                           err.error?.non_field_errors?.[0] || 
                           'Invalid email or password.';
      }
      console.error('Login Error:', err);
    }
  });
}
}