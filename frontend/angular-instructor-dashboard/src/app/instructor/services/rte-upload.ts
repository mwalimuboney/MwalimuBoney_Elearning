// src/app/instructor/services/rte-upload.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
// export class RteUploadService {
//   private apiUrl = 'http://localhost:8000/api';
//   private uploadEndpoint = `${this.apiUrl}/courses/upload-rte-image/`;

//   constructor(private http: HttpClient) { }

//   /**
//    * Uploads an image (from drag-and-drop/paste) to the backend.
//    * Django saves the image and returns the public URL.
//    * @param imageBlob The image data as a Blob or File object.
//    * @returns Observable<{ location: string }> The public URL where the image is hosted.
//    */
//   uploadRteImage(imageBlob: Blob): Observable<{ location: string }> {
//     const formData = new FormData();
//     // Use 'file' as the expected field name in the Django backend view
//     formData.append('file', imageBlob, 'editor-image.png'); 

//     // The backend must be configured to return a JSON object like: { location: "http://..." }
//     return this.http.post<{ location: string }>(this.uploadEndpoint, formData);
//   }
// }


@Injectable({ providedIn: 'root' })
export class RteUpload {
  private apiUrl = '/api'; // Use relative path in production
  private uploadEndpoint = `${this.apiUrl}/courses/upload-rte-image/`;

  constructor(private http: HttpClient) { }

  // Uploads an image blob (from drag-and-drop) to the backend
  uploadRteImage(imageBlob: Blob): Observable<{ location: string }> {
    const formData = new FormData();
    formData.append('file', imageBlob, 'editor-image.png');
    return this.http.post<{ location: string }>(this.uploadEndpoint, formData);
  }
}



// @Injectable({ providedIn: 'root' })
export class AIService {
  private apiUrl = '/api';
  private summarizeEndpoint = `${this.apiUrl}/ai/summarize/`;

  constructor(private http: HttpClient) { }

  // Calls the Django AI endpoint to generate a text summary
  summarizeText(text: string): Observable<{ summary: string }> {
    return this.http.post<{ summary: string }>(this.summarizeEndpoint, { text });
  }
}


// @Injectable({ providedIn: 'root' })
export class FileExtractionService {
  private apiUrl = '/api';
  private extractionEndpoint = `${this.apiUrl}/ai/extract-text/`;

  constructor(private http: HttpClient) { }

  // Uploads PDF/DOCX and retrieves extracted plain text
  extractText(file: File): Observable<{ content: string }> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<{ content: string }>(this.extractionEndpoint, formData);
  }
}