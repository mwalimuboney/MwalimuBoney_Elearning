

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-exam-builder',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './exam-builder.html',
  styleUrl: './exam-builder.css',
 
})
export class ExamBuilderComponent implements OnInit {
  examForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.examForm = this.fb.group({
      examTitle: ['', [Validators.required, Validators.minLength(5)]],
      durationMinutes: [60, [Validators.required, Validators.min(1)]],
      questions: this.fb.array([]) // Array for dynamic questions
    });

    // Start with one empty question
    this.addQuestion();
  }

  // Getter for easy access to questions array
  get questions(): FormArray {
    return this.examForm.get('questions') as FormArray;
  }

  // Add a new question block
  addQuestion(): void {
    const questionGroup = this.fb.group({
      text: ['', Validators.required],
      type: ['multiple-choice'],
      points: [1, [Validators.required, Validators.min(1)]],
      correctAnswer: ['', Validators.required]
    });
    this.questions.push(questionGroup);
  }

  removeQuestion(index: number): void {
    this.questions.removeAt(index);
  }

  saveExam(): void {
    if (this.examForm.valid) {
      console.log('Saving Exam Data Securely:', this.examForm.value);
      // Here you would call your ExamService to POST to Django
      alert('Exam Structure Saved Successfully!');
    }
  }
}