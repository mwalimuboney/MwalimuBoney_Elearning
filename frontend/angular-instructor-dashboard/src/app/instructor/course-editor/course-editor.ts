import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CourseService, Course, Lesson } from '../services/course';
import { RteUpload } from '../services/rte-upload';
import { AIService } from '../services/ai';
import { FileExtractionService } from '../services/file-extraction';
import { switchMap, catchError, takeUntil } from 'rxjs/operators';
import { of, Subject } from 'rxjs';
// Angular Material Imports
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

// 1. Import the child component classes
import { LessonEditorListComponent } from '../components/lesson-editor-list/lesson-editor-list';
// import { ResourceUploaderComponent } from '../resource-uploader/resource-uploader/resource-uploader';

@Component({
  selector: 'app-course-editor',
  templateUrl: './course-editor.html',
  styleUrl: './course-editor.css',
  imports: [CommonModule,         // Required for pipes/directives if not using @if
    MatTabsModule,       // Required for <mat-tab>
    MatFormFieldModule,   // Required for <mat-form-field>
    MatInputModule,       // Required for <input matInput> and <textarea matInput>
    MatButtonModule,      // Required for <button mat-raised-button>
    MatIconModule,        // Required for <mat-icon>
    MatCardModule,        // Required for <mat-card>
    MatSlideToggleModule, // Required for <mat-slide-toggle>
    ReactiveFormsModule, // Required for [formGroup]
    RouterModule,        // Required for [routerLink]
    LessonEditorListComponent,
    // ResourceUploaderComponent
  
  ]
})
export class CourseEditorComponent implements OnInit, OnDestroy {
  // 1. Lifecycle & Security Management
  private destroy$ = new Subject<void>();
  
  // 2. State Management for your HTML
  public courseForm!: FormGroup;
  public courseId!: number;
  public currentCourse: Course | null = null;
  public isNewCourse: boolean = false;
  public isSaving: boolean = false;
  public courses: Course[] = [];
  
  // Data passed to <app-lesson-editor-list>
  public courseLessons: Lesson[] = [];

  public tinymceConfig: any;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private rteUpload: RteUpload,
    private aiService: AIService,
    private fileExtractionService: FileExtractionService
  ) {
    this.initRteConfig();
  }

  ngOnInit(): void {
    this.initForm();

    // 3. Secure Data Fetching
    this.route.paramMap.pipe(
      switchMap(params => {
        const idParam = params.get('id');
        if (idParam === 'new' || !idParam) {
          this.isNewCourse = true;
          return of(null);
        }
        this.courseId = +idParam;
        return this.courseService.getCourse(this.courseId);
      }),
      catchError(err => {
        console.error('Data Load Security Error:', err);
        alert('Unauthorized or connection error while loading course.');
        return of(null);
      }),
      takeUntil(this.destroy$)
    ).subscribe(course => {
      if (course) {
        this.currentCourse = course;
        this.courseLessons = course.lessons || [];
        
        // Populate metadata fields
        this.courseForm.patchValue({
          title: course.title,
          description: course.description,
          is_published: course.is_published
        });
      }
    });
  }

  private initForm(): void {
    this.courseForm = this.fb.group({
      // Validators prevent empty or over-sized payloads
      title: ['', [Validators.required, Validators.maxLength(150)]],
      description: ['', [Validators.required, Validators.maxLength(5000)]],
      is_published: [false]
    });
  }

  /**
   * Bound to (ngSubmit) - Handles Metadata Save/Create
   */
  saveCourseDetails(): void {
    if (this.courseForm.invalid || this.isSaving) return;

    this.isSaving = true;
    const data = this.courseForm.value;

    const request$ = this.isNewCourse 
      ? this.courseService.createCourse(data) 
      : this.courseService.updateCourse(this.courseId, data);

    request$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (savedCourse) => {
        this.isSaving = false;
        alert('Course details securely synchronized.');
        
        if (this.isNewCourse) {
          // Navigate to Unlock Tabs
          this.router.navigate(['/instructor/courses', savedCourse.id, 'edit']);
        } else {
          this.currentCourse = savedCourse;
        }
      },
      error: (err) => {
        this.isSaving = false;
        alert(err.error?.detail || 'Update failed: Security or Validation error.');
      }
    });
  }

  /**
   * Hook for child component (app-lesson-editor-list) events
   */
  handleLessonChange(): void {
    if (!this.courseId) return;

    this.courseService.getCourse(this.courseId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (course) => this.courseLessons = course.lessons || [],
        error: () => console.error('Lesson Sync Failed')
      });
  }

  // --- AI & Extraction (Secure Integration) ---

  private initRteConfig(): void {
    this.tinymceConfig = {
      base_url: '/tinymce',
      suffix: '.min',
      plugins: 'image link lists table code',
      toolbar: 'undo redo | bold italic | ai-summary | code',
      images_upload_handler: (blobInfo: any) => {
        return new Promise((resolve, reject) => {
          this.rteUpload.uploadRteImage(blobInfo.blob())
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (res) => resolve(res.location),
              error: () => reject('Security Policy: Upload Rejected')
            });
        });
      },
      setup: (editor: any) => {
        editor.ui.registry.addButton('ai-summary', {
          text: 'AI Summary',
          onAction: () => this.triggerAiSummary(editor)
        });
      }
    };
  }

  triggerAiSummary(editor: any): void {
    const text = editor.selection.getContent({ format: 'text' });
    if (!text) { alert('Select text to summarize.'); return; }

    editor.setProgressState(true);
    this.aiService.summarizeText(text).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        editor.setProgressState(false);
        editor.insertContent(`<p class="ai-box"><strong>AI Summary:</strong> ${res.summary}</p>`);
      },
      error: () => {
        editor.setProgressState(false);
        alert('AI Service currently unavailable.');
      }
    });
  }

  handleContentDraftUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    // Simple client-side MIME check before sending to server
    const allowed = ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(file.type)) {
      alert('File type not permitted for extraction.');
      return;
    }

    this.fileExtractionService.extractText(file).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        const currentDesc = this.courseForm.get('description')?.value || '';
        this.courseForm.patchValue({ description: currentDesc + '\n\n' + res.content });
        alert('Draft extracted successfully.');
      },
      error: (err) => alert(err.error?.detail || 'Extraction failed.')
    });
  }

  ngOnDestroy(): void {
    // 4. Secure Cleanup
    this.destroy$.next();
    this.destroy$.complete();
  }


}

