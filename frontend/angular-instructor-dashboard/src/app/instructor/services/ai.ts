// src/app/instructor/services/ai.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AIService {
  private apiUrl = 'http://localhost:8000/api';
  private summarizeEndpoint = `${this.apiUrl}/ai/summarize/`;

  constructor(private http: HttpClient) { }

  /**
   * Calls the secure Django AI endpoint to generate a summary of the input text.
   * @param text The block of text selected by the teacher.
   * @returns Observable<{ summary: string }> The AI-generated summary.
   */
  summarizeText(text: string): Observable<{ summary: string }> {
    // Note: The Django backend validates the size of this text input.
    return this.http.post<{ summary: string }>(this.summarizeEndpoint, { text });
  }

  // Placeholder for future AI features (e.g., question generation)
  generateQuestions(text: string, num: number): Observable<any> {
    // return this.http.post(/* ... */);
    return new Observable(); 
  }
}