// src/app/instructor/services/report.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private apiUrl = 'http://localhost:8000/api'; 
  private reportEndpoint = `${this.apiUrl}/reports/student/`;

  constructor(private http: HttpClient) { }

  /**
   * GET: Triggers the backend to generate the ranked Report Card PDF.
   * @param studentId The ID of the student to generate the report for.
   * @param startDate The start date for the grading period.
   * @param endDate The end date for the grading period.
   * @returns Observable<Blob> The PDF file content as a binary blob.
   */
  generateReportCard(studentId: number, startDate: string, endDate: string): Observable<Blob> {
    
    // We must specify 'responseType: "blob"' to handle binary file data (PDF)
    return this.http.get(`${this.reportEndpoint}${studentId}/report_card/`, {
        params: { start: startDate, end: endDate },
        responseType: 'blob' 
    });
  }
}