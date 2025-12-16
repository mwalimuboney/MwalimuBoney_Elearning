// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-registration-validators',
//   imports: [],
//   templateUrl: './registration-validators.html',
//   styleUrl: './registration-validators.css',
// })
// export class RegistrationValidators {

// }
// src/app/core/auth/registration/registration.component.ts (Modification)

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// Import the necessary validator and service
import { uniqueCheckValidator } from '../registration-validators'; 
import { AuthService } from './auth';

@Component({ /* ... */ })
export class RegistrationComponent implements OnInit {
  registrationForm!: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService) {}

  ngOnInit(): void {
    this.registrationForm = this.fb.group({
      username: [
        '', 
        [Validators.required, Validators.minLength(4)], 
        [uniqueCheckValidator(this.authService, 'username')] // ASYNC Validator
      ],
      email: [
        '', 
        [Validators.required, Validators.email],
        [uniqueCheckValidator(this.authService, 'email')] // ASYNC Validator
      ],
      // Assumes phoneNumber is managed in a separate field or integrated here
      phoneNumber: [
        '',
        [Validators.required, Validators.pattern(/^\+[1-9]\d{1,14}$/)], // Basic international format
        [uniqueCheckValidator(this.authService, 'phoneNumber')] // ASYNC Validator
      ],
      password: ['', [Validators.required, Validators.minLength(8)]],
      // ... other fields
    });
  }
  
  // Getter to access form controls easily in the template
  get f() { return this.registrationForm.controls; }
  
  // ... submission logic
}