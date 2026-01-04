import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth/auth';
import { ProfileService } from '../services/profile'; // Your Profile Service
import { UserProfile } from '../role'; // Your Interface/Enum
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatDividerModule, 
    MatIconModule, 
    MatButtonModule
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class ProfileComponent implements OnInit {
  // Rename to userProfile$ for clarity in the HTML
  userProfile$!: Observable<UserProfile | null>;

  constructor(
    private authService: AuthService,
    private profileService: ProfileService // Inject the actual profile service
  ) {}

  ngOnInit(): void {
    // Priority 1: Use the dedicated profile stream
    // Priority 2: Fallback to authService profile if needed
    this.userProfile$ = this.profileService.profile$;
  }

  formatRole(role: string | undefined): string {
    if (!role) return 'User';
    return role.replace(/_/g, ' ').toLowerCase()
      .replace(/\b\w/g, char => char.toUpperCase());
  }
}