import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatButtonModule, 
    MatIconModule, 
    RouterModule
  ],
  templateUrl: './dashboard-home.html',
  styleUrl: './dashboard-home.css',
})
export class DashboardHomeComponent implements OnInit {
  // Mock data - in a real app, fetch this from an InstructorService
  stats = [
    { label: 'Active Courses', count: 12, icon: 'menu_book', color: '#3f51b5' },
    { label: 'Total Students', count: 450, icon: 'people', color: '#4caf50' },
    { label: 'Pending Exams', count: 5, icon: 'assignment_late', color: '#ff9800' }
  ];

  constructor() {}

  ngOnInit(): void {}
}