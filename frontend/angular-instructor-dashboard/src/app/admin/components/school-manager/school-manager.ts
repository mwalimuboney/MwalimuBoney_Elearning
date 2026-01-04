import { Component, OnInit } from '@angular/core';
import { CourseService, School } from '../../../instructor/services/course';
// import { SchoolManagerService } from '../../school-manager'; // Ensure this model exists
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-school-management',
  standalone: true,
  templateUrl: './school-manager.html',
  styleUrl: './school-manager.css',
  imports: [
    CommonModule
  ] // Add CommonModule if not using Angular 17+ or needing specific pipes
})
export class SchoolManagerComponent implements OnInit {
  schools: School[] = [];

  constructor(private courseService: CourseService) {}

  ngOnInit() {
    this.loadSchools();
  }

  loadSchools() {
    this.courseService.getSchools().subscribe({
      next: (data) => this.schools = data,
      error: (err) => console.error('Error loading schools', err)
    });
  }

  openCreateModal() { /* Logic for modal */ }
  viewDepartments(id: number) { /* Navigate to department view */ }
  editSchool(school: School) { /* Open edit form */ }
}