import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router'; 
import { RouterLink } from '@angular/router';
// FIX: Import both the Class and the Function from the auth file
import { AuthService, uniqueCheckValidator } from '../../../services/registration-validators';

@Component({ 
  selector: 'app-registration',
  templateUrl: './registration-validators.html',
  styleUrl: './registration-validators.css',
  standalone: true, 
  imports: [ReactiveFormsModule, RouterLink]
})
export class RegistrationValidatorsComponent implements OnInit {
  registrationForm!: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder, 
    private authService: AuthService, // Injected as a class
    private router: Router
  ) {}

  ngOnInit(): void {
    this.registrationForm = this.fb.group({
      username: ['', 
        { 
          validators: [Validators.required, Validators.minLength(4)], 
          // uniqueCheckValidator is now available as a standalone function
          asyncValidators: [uniqueCheckValidator(this.authService, 'username')],
          updateOn: 'blur' 
        }
      ],
      email: ['', 
        { 
          validators: [Validators.required, Validators.email], 
          asyncValidators: [uniqueCheckValidator(this.authService, 'email')],
          updateOn: 'blur' 
        }
      ],
      phoneNumber: ['', 
        { 
          validators: [Validators.required, Validators.pattern(/^\+[1-9]\d{1,14}$/)], 
          asyncValidators: [uniqueCheckValidator(this.authService, 'phoneNumber')],
          updateOn: 'blur' 
        }
      ],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  onSubmit(): void {
  if (this.registrationForm.invalid) return;
    
  this.isSubmitting = true;
  
  this.authService.register(this.registrationForm.value).subscribe({
    next: () => {
      this.isSubmitting = false;
      this.router.navigate(['/login']); 
    },
    // Ensure this parameter is named 'err' or something different 
    // to avoid clashing with the global 'Error' class
    error: (err: any) => { 
      console.error('Registration failed', err);
      this.isSubmitting = false;
    }
  });
}
  get f() { return this.registrationForm.controls; }

}