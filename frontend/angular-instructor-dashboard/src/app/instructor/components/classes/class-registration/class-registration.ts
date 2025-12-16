// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-class-registration',
//   imports: [],
//   templateUrl: './class-registration.html',
//   styleUrl: './class-registration.css',
// })
// export class ClassRegistration {

// }

// src/app/instructor/components/classes/class-registration/class-registration.component.ts

import { Component, OnInit } from '@angular/core';
import { ClassService, TeacherClass, ClassRosterStudent } from '../../../services/class';
import { Observable, Subject, combineLatest, of } from 'rxjs';
import { switchMap, debounceTime, distinctUntilChanged, startWith, tap, map, catchError } from 'rxjs/operators';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-class-registration',
  templateUrl: './class-registration.html',
  styleUrls: ['./class-registration.css']
})
export class ClassRegistrationComponent implements OnInit {

  public teacherClasses$!: Observable<TeacherClass[]>;
  public availableStudents$!: Observable<ClassRosterStudent[]>;
  public selectedClass: TeacherClass | null = null;
  public searchControl = new FormControl('');
  public isLoading: boolean = true;
  public isSaving: boolean = false;

  constructor(private classService: ClassService) { }

  ngOnInit(): void {
    this.teacherClasses$ = this.classService.getTeacherClasses().pipe(
      tap(classes => {
        this.isLoading = false;
        // Automatically select the first class for easy management
        if (classes.length > 0) {
          this.selectedClass = classes[0];
        }
      })
    );
    
    // Setup for student search: debounced input leads to API call
    this.availableStudents$ = this.searchControl.valueChanges.pipe(
        startWith(''),
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => this.isSaving = true),
        switchMap(query => {
            if (query && query.length > 2) {
                return this.classService.searchAvailableStudents(query).pipe(
                    catchError(err => {
                        console.error("Search failed:", err);
                        return of([]);
                    })
                );
            }
            return of([]);
        }),
        tap(() => this.isSaving = false)
    );
  }

  // --- UI Actions ---

  /**
   * Called from the UI when the teacher selects a class from the list.
   */
  selectClass(teacherClass: TeacherClass): void {
    this.selectedClass = teacherClass;
    // Clear search when switching classes
    this.searchControl.setValue('', { emitEvent: false }); 
  }

  /**
   * Enrolls a student into the currently selected class.
   */
  enrollStudent(student: ClassRosterStudent): void {
    if (!this.selectedClass) return;
    this.isSaving = true;

    this.classService.enrollStudent(this.selectedClass.id, student.id).subscribe({
      next: () => {
        alert(`${student.username} enrolled successfully.`);
        this.refreshData(); // Re-fetch class roster and search results
      },
      error: (err) => {
        alert('Enrollment failed. Student may already be in a class.');
        this.isSaving = false;
      }
    });
  }

  /**
   * Unenrolls a student from the selected class.
   */
  unenrollStudent(studentId: number): void {
    if (!this.selectedClass || !confirm("Are you sure you want to unenroll this student?")) return;
    this.isSaving = true;

    this.classService.unenrollStudent(this.selectedClass.id, studentId).subscribe({
      next: () => {
        alert('Student unenrolled.');
        this.refreshData(); // Re-fetch class roster
      },
      error: (err) => {
        alert('Unenrollment failed.');
        this.isSaving = false;
      }
    });
  }
  
  /**
   * Utility to refresh both the class list and clear the student search.
   */
  private refreshData(): void {
      this.isSaving = false;
      // Re-fetch classes and update the selectedClass with the new roster
      this.teacherClasses$ = this.classService.getTeacherClasses().pipe(
          tap(classes => {
              const updatedClass = classes.find(c => c.id === this.selectedClass?.id);
              if (updatedClass) {
                  this.selectedClass = updatedClass;
              } else if (classes.length > 0) {
                  this.selectedClass = classes[0];
              }
          })
      );
      // Re-run the search with the current query
      this.searchControl.setValue(this.searchControl.value);
  }
}