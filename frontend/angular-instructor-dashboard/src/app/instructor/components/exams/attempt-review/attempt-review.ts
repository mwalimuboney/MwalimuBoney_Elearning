import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { ActivatedRoute } from '@angular/router';

interface QuestionReview {
  text: string;
  studentAnswer: string;
  correctAnswer: string;
  pointsEarned: number;
  maxPoints: number;
  isCorrect: boolean;
  feedback?: string;
}

@Component({
  selector: 'app-attempt-review',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatChipsModule, MatDividerModule],
  templateUrl: './attempt-review.html',
  styleUrl: './attempt-review.css'
})
export class AttemptReviewComponent implements OnInit {
  attemptId!: number;
  studentName: string = "John Doe"; // Mock data
  examTitle: string = "Physics Mid-Term";
  totalScore: number = 0;
  maxPossibleScore: number = 0;

  reviews: QuestionReview[] = [
    {
      text: "What is the unit of Force?",
      studentAnswer: "Newton",
      correctAnswer: "Newton",
      pointsEarned: 5,
      maxPoints: 5,
      isCorrect: true,
      feedback: "Great job! Sir Isaac Newton would be proud."
    },
    {
      text: "Is light a wave or a particle?",
      studentAnswer: "Wave",
      correctAnswer: "Both (Duality)",
      pointsEarned: 0,
      maxPoints: 5,
      isCorrect: false,
      feedback: "Actually, light exhibits both wave-like and particle-like properties."
    }
  ];

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.attemptId = Number(this.route.snapshot.paramMap.get('id'));
    this.calculateTotals();
  }

  private calculateTotals(): void {
    this.totalScore = this.reviews.reduce((acc, curr) => acc + curr.pointsEarned, 0);
    this.maxPossibleScore = this.reviews.reduce((acc, curr) => acc + curr.maxPoints, 0);
  }

  getGradePercentage(): number {
    return (this.totalScore / this.maxPossibleScore) * 100;
  }
}