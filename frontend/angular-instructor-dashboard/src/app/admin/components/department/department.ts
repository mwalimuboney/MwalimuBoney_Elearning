import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CourseService } from '../../../instructor/services/course';
import { Department } from '../../department';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-department',
  imports: [CommonModule],
  templateUrl: './department.html',
  styleUrl: './department.css',
})



export class DepartmentManagementComponent implements OnInit {
  departments: Department[] = [];
  schoolId!: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService
  ) {}

  ngOnInit() {
    // Get schoolId from the URL params
    this.schoolId = Number(this.route.snapshot.paramMap.get('schoolId'));
    this.loadDepartments();
  }

  loadDepartments() {
    // We'll assume the service has a getDepartmentsBySchool(id) method
    this.courseService.getDepartments(this.schoolId).subscribe({
      next: (data) => this.departments = data,
      error: (err) => console.error('Failed to load departments', err)
    });
  }

  viewCourses(deptId: number) {
    this.router.navigate(['/manage-courses'], { queryParams: { dept: deptId } });
  }

  addDepartment() { /* Modal Logic */ }
  editDept(dept: Department) { /* Modal Logic */ }
  
}


