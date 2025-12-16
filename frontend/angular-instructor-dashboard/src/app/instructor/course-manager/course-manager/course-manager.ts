// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-course-manager',
//   imports: [],
//   templateUrl: './course-manager.html',
//   styleUrl: './course-manager.css',
// })
// export class CourseManager {

// }

// src/app/instructor/course-manager/course-manager.component.ts (Conceptual)

import { Component, OnInit } from '@angular/core';
import { CourseService } from '../services/course.service';
import { Observable } from 'rxjs';
import { Course } from '../services/course.service'; // Import the interface

@Component({
  selector: 'app-course-manager',
  templateUrl: './course-manager.component.html',
  styleUrls: ['./course-manager.component.scss']
})
export class CourseManagerComponent implements OnInit {

  // Use the async pipe for efficient data binding and lifecycle management
  public courses$!: Observable<Course[]>;
  public isLoading: boolean = false;

  constructor(
    private courseService: CourseService,
    // Inject Router for navigation
    private router: Router 
  ) {}

  ngOnInit(): void {
    // Load the list of courses immediately upon component initialization
    this.loadCourses();
  }

  /**
   * Fetches the list of all courses posted by this instructor/admin.
   */
  loadCourses(): void {
    this.isLoading = true;
    // We store the Observable itself and let the template subscribe using the async pipe
    this.courses$ = this.courseService.getCourses().pipe(
      // Simulate stopping loading after the first successful fetch
      tap(() => this.isLoading = false), 
      catchError(err => {
        this.isLoading = false;
        // Handle error (e.g., show a toast message)
        console.error('Error loading courses:', err); 
        return of([]); // Return an empty array on error to prevent app crash
      })
    );
  }

  /**
   * Handles the Publish/Draft toggle action.
   */
  togglePublishStatus(courseId: number, currentStatus: boolean): void {
    const newStatus = !currentStatus;
    
    this.courseService.updateCourse(courseId, { is_published: newStatus }).subscribe({
      next: (updatedCourse) => {
        // Log success and then reload the courses to update the list
        console.log(`Course ${updatedCourse.title} status updated to ${newStatus ? 'Published' : 'Draft'}`);
        this.loadCourses(); // Refresh the data stream
      },
      error: (err) => {
        console.error('Failed to update course status:', err);
        // Show user-friendly error message
      }
    });
  }

  /**
   * Handles course deletion.
   */
  deleteCourse(courseId: number): void {
    if (confirm('Are you sure you want to delete this course? This action is irreversible.')) {
      this.courseService.deleteCourse(courseId).subscribe({
        next: () => {
          console.log(`Course ${courseId} deleted.`);
          this.loadCourses(); // Refresh the data stream after successful deletion
        },
        error: (err) => {
          console.error('Failed to delete course:', err);
        }
      });
    }
  }

  /**
   * Navigation to the Course Editor Component.
   */
  editCourse(courseId: number): void {
    this.router.navigate(['/instructor/courses', courseId, 'edit']);
  }
  
  /**
   * Navigation to the Course Creation Form.
   */
  createNewCourse(): void {
    this.router.navigate(['/instructor/courses/new']);
  }
}