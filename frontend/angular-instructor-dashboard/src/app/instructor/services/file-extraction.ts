// src/app/instructor/services/file-extraction.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FileExtractionService {
  private apiUrl = 'http://localhost:8000/api';
  private extractionEndpoint = `${this.apiUrl}/ai/extract-text/`; // Use the new endpoint

  constructor(private http: HttpClient) { }

  /**
   * Uploads the file and retrieves the extracted plain text content.
   * @param file The PDF or DOCX file to process.
   * @returns Observable<{ content: string }> The extracted text.
   */
  extractText(file: File): Observable<{ content: string }> {
    const formData = new FormData();
    // The backend expects the file key to be 'file'
    formData.append('file', file, file.name); 

    return this.http.post<{ content: string }>(this.extractionEndpoint, formData);
  }
}