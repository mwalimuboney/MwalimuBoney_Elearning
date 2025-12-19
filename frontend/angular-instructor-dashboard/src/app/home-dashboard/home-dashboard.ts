import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../core/auth/auth'; // Verify path

@Component({
  selector: 'app-home-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    MatIconModule, 
    MatButtonModule, 
    MatSnackBarModule
  ],
  templateUrl: './home-dashboard.html',
  styleUrl: './home-dashboard.css',
})
export class HomeDashboardComponent implements OnInit {
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private authService = inject(AuthService);

  // Auth States
  isLoggedIn = false;
  isTeacher = false;
  isAdmin = false;
  userName = 'Guest';
  greeting = '';


  // Data
  resources = [
    { name: 'Algebra 101', views: 120, date: '2 hours ago', uploader: 'Prof. Boney' },
    { name: 'Physics Basics', views: 85, date: '5 hours ago', uploader: 'Admin Wasilwa' },
    { name: 'World History', views: 200, date: '1 day ago', uploader: 'Dr. Jane' },
    { name: 'Organic Chemistry', views: 45, date: '3 days ago', uploader: 'Prof. Boney' }
  ];

  ngOnInit() {
    this.updateGreeting();
    this.checkAuthStatus();
  }



  // Logic to determine "Good Morning", "Good Afternoon", etc.
  updateGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) this.greeting = 'Good Morning';
    else if (hour < 17) this.greeting = 'Good Afternoon';
    else this.greeting = 'Good Evening';
  }

  checkAuthStatus() {
    this.isLoggedIn = this.authService.isLoggedIn;
    if (this.isLoggedIn) {
      const role = this.authService.getUserRole();
      this.isTeacher = role === 'TEACHER';
      this.isAdmin = role === 'ADMIN';
      this.userName = this.authService.getUserName(); // Assume this method exists
    }
  }

  // The logic for resource clicks (Guest protection)
  handleResourceClick(res: any) {
    if (!this.isLoggedIn) {
      this.snackBar.open('Please login to view full resources', 'Login', {
        duration: 3000,
        verticalPosition: 'top'
      }).onAction().subscribe(() => {
        this.router.navigate(['/login']);
      });
    } else {
      console.log('Opening resource:', res.name);
      // this.router.navigate(['/resources', res.id]);
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  scrollTo(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}