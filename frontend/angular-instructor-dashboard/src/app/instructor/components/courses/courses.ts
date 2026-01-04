import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { CourseService } from '../../services/course'; 
import { Course } from '../../services/course';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-courses',
  imports: [CommonModule],
  templateUrl: './courses.html',
  styleUrl: './courses.css',
})
export class CoursesComponent  implements OnInit {
  
  // Observable to hold the list of courses, allowing the template to use the async pipe
  courses$!: Observable<Course[]>; 
  isLoading = false;
  errorMessage: string | null = null;

  constructor(private courseService: CourseService) { }

  ngOnInit(): void {
    this.loadCourses();
  }

  /**
   * Fetches the list of all available courses.
   */
  loadCourses(): void {
    this.isLoading = true;
    this.errorMessage = null;

    // Use the service to get the courses. 
    // The service handles the API interaction with your Django backend.
    this.courses$ = this.courseService.getCourses(); 

    // Optional: Subscribe here if you need to perform actions after data arrives,
    // but using the async pipe in the template is often cleaner.
    this.courses$.subscribe({
      next: (courses) => {
        console.log('Courses loaded successfully:', courses);
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load courses. Please try again.';
        this.isLoading = false;
        console.error('API Error:', err);
      }
    });
  }

  /**
   * Handles navigation or selection when a course card is clicked.
   * @param courseId The ID of the selected course.
   */
  selectCourse(courseId: number): void {
    // In a real application, you would navigate to the course detail page:
    // this.router.navigate(['/courses', courseId]); 
    console.log(`Course ${courseId} selected.`);
  }
}
