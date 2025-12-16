// // import { Component } from '@angular/core';

// // @Component({
// //   selector: 'app-course-editor',
// //   imports: [],
// //   templateUrl: './course-editor.html',
// //   styleUrl: './course-editor.css',
// // })
// // export class CourseEditor {

// // }
// // src/app/instructor/course-editor/course-editor.component.ts (Conceptual)

// import { Component, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { ActivatedRoute, Router } from '@angular/router';
// import { CourseService, Course, Lesson } from '../services/course.service';
// import { switchMap, catchError, tap } from 'rxjs/operators';
// import { of } from 'rxjs';

// @Component({
//   selector: 'app-course-editor',
//   templateUrl: './course-editor.component.html',
//   styleUrls: ['./course-editor.component.scss']
// })
// export class CourseEditorComponent implements OnInit {

//   courseForm!: FormGroup;
//   courseId!: number;
//   currentCourse!: Course;
//   isNewCourse: boolean = false;
  
//   // Lessons will be managed by the nested component, but fetched here initially
//   public courseLessons: Lesson[] = []; 

//   constructor(
//     private fb: FormBuilder,
//     private route: ActivatedRoute,
//     private router: Router,
//     private courseService: CourseService
//   ) {}

//   ngOnInit(): void {
//     // 1. Initialize the main form (Reactive Form)
//     this.courseForm = this.fb.group({
//       title: ['', Validators.required],
//       description: ['', Validators.required],
//       is_published: [false] // Can be toggled here or in the manager component
//     });

//     // 2. Check route for ID to determine New vs. Edit mode
//     this.route.paramMap.pipe(
//       switchMap(params => {
//         const idParam = params.get('id');
//         if (idParam === 'new') {
//           this.isNewCourse = true;
//           return of(null); // No course to load
//         }
//         this.courseId = +idParam!;
//         return this.courseService.getCourse(this.courseId); // Load existing course
//       }),
//       catchError(err => {
//         console.error('Error loading course:', err);
//         // Handle API error gracefully
//         return of(null);
//       })
//     ).subscribe(course => {
//       if (course) {
//         this.currentCourse = course;
//         this.courseLessons = course.lessons; // Load nested data
//         this.courseForm.patchValue(course); // Populate the form fields
//       }
//     });
//   }
  
//   /**
//    * Saves or updates the main course metadata (Title, Description, etc.)
//    */
//   saveCourseDetails(): void {
//     if (this.courseForm.invalid) {
//       // Show validation errors
//       return;
//     }
    
//     const data = this.courseForm.value;

//     if (this.isNewCourse) {
//       // POST a new course
//       this.courseService.createCourse(data).subscribe(newCourse => {
//         console.log('Course created:', newCourse);
//         // Navigate to the edit view of the newly created course
//         this.router.navigate(['/instructor/courses', newCourse.id, 'edit']);
//       });
//     } else {
//       // PATCH/PUT existing course
//       this.courseService.updateCourse(this.courseId, data).subscribe(updatedCourse => {
//         console.log('Course updated:', updatedCourse);
//         // Show success message
//       });
//     }
//   }

//   // Helper method for lesson management: refreshes the lesson list after a change
//   handleLessonChange(): void {
//     // Re-fetch only the lessons for this course to keep the list synchronized
//     this.courseService.getLessonsByCourse(this.courseId).subscribe(lessons => {
//       this.courseLessons = lessons;
//     });
//   }
// }



// src/app/instructor/components/courses/course-editor/course-editor.component.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CourseService, Course, Lesson, Resource } from '../../../services/course.service';
import { RteUploadService } from '../../../services/rte-upload.service';

@Component({...})
export class CourseEditorComponent implements OnInit {
  public tinymceConfig: any; 
  
  constructor(private fb: FormBuilder, private rteUploadService: RteUploadService) {
    this.initForm();
    this.initRteConfig(); // Initialize configuration
  }
  
  initRteConfig() {
    this.tinymceConfig = {
      base_url: '/tinymce', // Assuming base URL setup
      suffix: '.min',
      plugins: 'image link lists table media code autolink',
      toolbar: 'undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image media | ai-summary | code',
      height: 500,
      menubar: false,
      
      // 1. Image Handling for Drag-and-Drop / Paste
      images_upload_handler: (blobInfo: any, success: any, failure: any) => {
        const file = blobInfo.blob();
        
        this.rteUploadService.uploadRteImage(file).subscribe({
          next: (response) => {
            // Success handler must be called with the public URL
            success(response.location);
          },
          error: (err) => {
            console.error('RTE Image Upload Failed:', err);
            failure('Image upload failed due to server error.');
          }
        });
      },
      
      // 2. Custom Button for AI Summary (Placeholder for AI integration)
      setup: (editor: any) => {
        editor.ui.registry.addButton('ai-summary', {
          text: 'AI Summarize',
          onAction: () => this.triggerAiSummary(editor)
        });
      }
    };
  }
  
  // Method to be called by the custom button
  triggerAiSummary(editor: any) {
      const selectedText = editor.selection.getContent({ format: 'text' });
      if (!selectedText) {
          alert("Please select text to summarize.");
          return;
      }
      // This calls the AI service (to be implemented next)
      // this.aiService.summarize(selectedText).subscribe(summary => { editor.insertContent(summary); });
      alert("AI summarization triggered for selected text!");
  }
  // ... rest of the component logic ...

  courseForm!: FormGroup;
  isEditMode: boolean = false;
  courseId: number | null = null;
  isSaving: boolean = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService
  ) {}

  ngOnInit(): void {
    this.courseId = this.route.snapshot.params['id'];
    this.isEditMode = !!this.courseId;

    this.initForm();

    if (this.isEditMode) {
      this.loadCourseData(this.courseId!);
    }
  }
  
  initForm(): void {
    this.courseForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      is_published: [false],
      // FormArray to hold all lessons dynamically
      lessons: this.fb.array([]) 
    });
  }

  // Convenience getter for lessons FormArray
  get lessons(): FormArray {
    return this.courseForm.get('lessons') as FormArray;
  }
  
  // Method to create a new Lesson FormGroup
  private createLessonFormGroup(lesson: Partial<Lesson> = {}): FormGroup {
    return this.fb.group({
      id: [lesson.id || null],
      title: [lesson.title || 'New Lesson Title', Validators.required],
      order: [lesson.order || this.lessons.length + 1],
      // Nested FormArray for resources (simpler approach: manage resources outside FormArray)
      resources: [lesson.resources || []] // Store resources as a simple array for now
    });
  }

  addLesson(): void {
    this.lessons.push(this.createLessonFormGroup());
  }

  removeLesson(index: number): void {
    this.lessons.removeAt(index);
    // Optionally trigger API call to delete the lesson if it has an ID
    // this.deleteLessonAPI(lessonId);
  }
  
  // --- Data Loading and Submission ---

  loadCourseData(id: number): void {
    this.courseService.getCourse(id).subscribe(course => {
      this.courseForm.patchValue({
        title: course.title,
        description: course.description,
        is_published: course.is_published
      });
      // Populate FormArray with existing lessons
      course.lessons.forEach(lesson => {
        this.lessons.push(this.createLessonFormGroup(lesson));
      });
    });
  }

  onSubmit(): void {
    if (this.courseForm.invalid) return;
    this.isSaving = true;

    const courseData = this.courseForm.value;
    
    // 1. Save Course Metadata (Title, Description)
    const saveObservable = this.isEditMode
      ? this.courseService.updateCourse(this.courseId!, courseData)
      : this.courseService.createCourse(courseData);

    saveObservable.subscribe({
      next: (savedCourse) => {
        // 2. Handle Lesson Updates/Creation (Requires separate logic to iterate FormArray)
        // ... Logic to diff lessons, send POST/PATCH requests to /lessons/ ...
        
        alert(`Course "${savedCourse.title}" saved successfully!`);
        this.router.navigate(['/instructor/courses']);
      },
      error: (err) => {
        alert('Failed to save course.');
        this.isSaving = false;
      }
    });
  }
  
  // --- RESOURCE MANAGEMENT LOGIC ---
  
  // This method encapsulates the Antivirus-protected file upload
  onFileSelected(event: Event, lessonIndex: number): void {
      const input = event.target as HTMLInputElement;
      if (!input.files?.length) return;
      
      const file = input.files[0];
      const lessonFormGroup = this.lessons.at(lessonIndex);
      const lessonId = lessonFormGroup.get('id')?.value;
      const fileTitle = prompt("Enter a title for this resource:");
      
      if (!lessonId || !fileTitle) return; // Must save lesson first to get ID
      
      this.courseService.uploadResource(lessonId, fileTitle, file).subscribe({
          next: (resource) => {
              const currentResources: Resource[] = lessonFormGroup.get('resources')?.value || [];
              currentResources.push(resource);
              lessonFormGroup.get('resources')?.setValue(currentResources);
              alert(`Resource uploaded. Antivirus Status: ${resource.antivirus_status}`);
          },
          error: (err) => {
              // This captures the 'malware_detected' and 'file_too_large' errors
              const errorMessage = err.error?.file?.[0]?.message || 'File upload failed.';
              alert(`Upload Error: ${errorMessage}`);
          }
      });
  }
  // src/app/instructor/components/courses/course-editor/course-editor.component.ts (Additions)

// ... inside CourseEditorComponent class ...

  handleContentDraftUpload(event: Event): void {
      const input = event.target as HTMLInputElement;
      if (!input.files?.length) return;
      
      const file = input.files[0];
      
      FileExtractionUtil.extractTextFromFile(file).then(extractedText => {
          // Get a reference to the active TinyMCE editor instance
          const editor = (window as any).tinymce.activeEditor;
          
          if (editor) {
              // Append the extracted text to the main content field
              editor.setContent(editor.getContent() + '\n\n' + extractedText);
              alert(`${file.name} content successfully loaded into the editor.`);
          }
      }).catch(err => {
          alert(`Failed to extract content: ${err}`);
      });
  }

  // src/app/instructor/components/courses/course-editor/course-editor.component.ts (Modification)

// ... Import FileExtractionService and inject it in the constructor ...

  handleContentDraftUpload(event: Event): void {
      const input = event.target as HTMLInputElement;
      const file = input.files?.[0];
      
      if (!file) return;

      const editor = (window as any).tinymce.activeEditor;
      if (!editor) return;
      
      const originalContent = editor.getContent();
      const loadingMessage = `<p>Processing ${file.name}... Please wait.</p>`;

      editor.setContent(originalContent + loadingMessage);
      editor.setProgressState(true);

      this.fileExtractionService.extractText(file).subscribe({
          next: (response) => {
              editor.setProgressState(false);
              const extractedText = response.content;
              
              // Remove the loading message and append the extracted text
              editor.setContent(originalContent + '\n\n' + extractedText);
              alert(`${file.name} content successfully extracted and loaded.`);
          },
          error: (err) => {
              editor.setProgressState(false);
              editor.setContent(originalContent); // Revert or show clean error
              alert(`Extraction failed: ${err.error?.detail || 'Server error occurred during processing.'}`);
          }
      });
  }
}








// modified
// FILE: src/app/instructor/components/courses/course-editor/course-editor.component.ts

import { Component, OnInit } from '@angular/core';
import { RteUploadService } from '../../../services/rte-upload.service';
import { AIService } from '../../../services/ai.service';
import { FileExtractionService } from '../../../services/file-extraction.service';
// NOTE: Assume you have installed 'tinymce-angular' for the RTE

@Component({
  selector: 'app-course-editor',
  templateUrl: './course-editor.component.html',
  styleUrls: ['./course-editor.component.scss']
})
export class CourseEditorComponent implements OnInit {
  
  public courseContent: string = ''; // Bound to the RTE
  public tinymceConfig: any;
  
  constructor(
    private rteUploadService: RteUploadService,
    private aiService: AIService,
    private fileExtractionService: FileExtractionService
  ) {}

  ngOnInit() {
    this.initRteConfig();
  }

  initRteConfig() {
    this.tinymceConfig = {
      base_url: '/tinymce',
      suffix: '.min',
      plugins: 'image link lists table code',
      toolbar: 'undo redo | formatselect | bold italic backcolor | link image | ai-summary | ai-generate-q',
      height: 500,
      
      // 1. RTE Image Upload Handler (Handles Drag-and-Drop)
      images_upload_handler: (blobInfo: any, success: any, failure: any) => {
        const file = blobInfo.blob();
        this.rteUploadService.uploadRteImage(file).subscribe({
          next: (response) => success(response.location),
          error: (err) => {
            console.error('Image Upload Failed:', err);
            failure('Image upload failed due to server error.');
          }
        });
      },
      
      // 2. Custom Buttons Setup for AI
      setup: (editor: any) => {
        editor.ui.registry.addButton('ai-summary', {
          text: 'AI Summarize',
          onAction: () => this.triggerAiSummary(editor)
        });
        editor.ui.registry.addButton('ai-generate-q', {
          text: 'AI Qs',
          onAction: () => alert('AI Question Generation triggered (Backend integration pending).')
        });
      }
    };
  }
  
  // Method to handle AI Summarization logic
  triggerAiSummary(editor: any) {
      const selectedText = editor.selection.getContent({ format: 'text' });
      if (!selectedText) { alert("Please select text to summarize."); return; }
      
      const originalContent = editor.getContent();
      editor.setProgressState(true); 

      this.aiService.summarizeText(selectedText).subscribe({
          next: (response) => {
              editor.setProgressState(false);
              const summary = response.summary;
              
              const action = prompt("AI Summary Complete! Type 'REPLACE' or 'APPEND':");
              
              if (action?.toUpperCase() === 'REPLACE') {
                  editor.selection.setContent(summary);
              } else if (action?.toUpperCase() === 'APPEND') {
                  editor.insertContent(`<p class="ai-summary"><strong>Summary:</strong> ${summary}</p>`);
              }
          },
          error: (err) => {
              editor.setProgressState(false);
              alert(`AI Summarization failed: ${err.error?.detail || 'Server error.'}`);
          }
      });
  }

  // Method to handle file extraction upload
  handleContentDraftUpload(event: Event): void {
      const input = event.target as HTMLInputElement;
      const file = input.files?.[0];
      if (!file) return;
      
      const editor = (window as any).tinymce.activeEditor;
      if (!editor) return;

      editor.setProgressState(true);

      this.fileExtractionService.extractText(file).subscribe({
          next: (response) => {
              editor.setProgressState(false);
              const extractedText = response.content;
              editor.insertContent('\n\n' + extractedText); // Append to current content
              alert(`${file.name} content successfully loaded.`);
          },
          error: (err) => {
              editor.setProgressState(false);
              alert(`Extraction failed: ${err.error?.detail || 'Server error occurred.'}`);
          }
      });
  }
}