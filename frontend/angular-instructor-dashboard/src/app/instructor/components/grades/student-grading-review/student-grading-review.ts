// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-student-grading-review',
//   imports: [],
//   templateUrl: './student-grading-review.html',
//   styleUrl: './student-grading-review.css',
// })
// export class StudentGradingReview {

// }


// src/app/instructor/components/grades/student-grading-review/student-grading-review.component.ts

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReportService } from '../../../services/report'; 
import { saveAs } from 'file-saver'; // A common library used for saving blobs/files client-side

@Component({
  selector: 'app-student-grading-review',
  templateUrl: './student-grading-review.html',
  styleUrls: ['./student-grading-review.css']
})
export class StudentGradingReviewComponent implements OnInit {

  public studentId!: number;
  public studentName: string = 'Loading...'; 
  public isGenerating: boolean = false;
  
  // Hardcoded date range for demonstration (Teacher would use date pickers in UI)
  public reportStartDate: string = '2025-01-01';
  public reportEndDate: string = '2025-12-31';

  constructor(
    private route: ActivatedRoute,
    private reportService: ReportService
  ) {}

  ngOnInit(): void {
    // 1. Get Student ID from the route parameters
    this.route.params.subscribe(params => {
      this.studentId = +params['studentId']; 
      // In a real scenario, you'd fetch student details here to get the studentName
      this.fetchStudentDetails(this.studentId);
    });
  }
  
  // (Assume this method exists to fetch student profile data)
  fetchStudentDetails(id: number) {
      // ... API call to get student profile and name
      this.studentName = 'Student Name Placeholder';
  }


  /**
   * Handles the click event to generate and download the Report Card PDF.
   */
  generateAndDownloadReport(): void {
    if (this.isGenerating) return;

    this.isGenerating = true;
    
    this.reportService.generateReportCard(this.studentId, this.reportStartDate, this.reportEndDate).subscribe({
      next: (pdfBlob: Blob) => {
        // 2. Use file-saver library to prompt the user to download the file
        saveAs(pdfBlob, `ReportCard_${this.studentName}_${this.reportEndDate}.pdf`);
        alert(`Report card for ${this.studentName} downloaded successfully.`);
      },
      error: (err) => {
        console.error('Report Generation Failed:', err);
        const errorDetail = err.error?.detail || "An error occurred during report generation.";
        alert(`Failed to generate report: ${errorDetail}`);
      },
      complete: () => {
        this.isGenerating = false;
      }
    });
  }
}
