
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { Lesson } from '../../services/course'; // Ensure this path matches your service

@Component({
  selector: 'app-lesson-editor-list',
  standalone: true,
  imports: [
    CommonModule, 
    MatExpansionModule, 
    MatButtonModule, 
    MatIconModule, 
    MatListModule
  ],
  templateUrl: './lesson-editor-list.html',
  styleUrl: './lesson-editor-list.css'
})
export class LessonEditorListComponent {
  @Input() courseId!: number;
  @Input() lessons: Lesson[] = [];
  @Output() onChanged = new EventEmitter<void>();

  constructor() {}

  addLesson(): void {
    // Logic to open a dialog or navigate to a lesson creator
    console.log('Adding lesson to course:', this.courseId);
  }

  editLesson(lessonId: number): void {
    console.log('Editing lesson:', lessonId);
  }

  deleteLesson(lessonId: number): void {
    if (confirm('Are you sure you want to delete this lesson?')) {
      // Call service and then emit onChanged
      this.onChanged.emit();
    }
  }
}