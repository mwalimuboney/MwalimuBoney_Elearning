// FILE: src/app/shared/services/fr.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FRService {
  private apiUrl = '/api';
  private frEndpoint = `${this.apiUrl}/ai/fr/`;
  
  constructor(private http: HttpClient) { }

  // 1. Trigger template generation after photo capture
  triggerEnrollment(photoBlob: Blob): Observable<any> {
    const formData = new FormData();
    formData.append('live_photo', photoBlob, 'enrollment_scan.png');
    return this.http.post(`${this.frEndpoint}enroll/trigger/`, formData);
  }

  // 2. Fetch Admin FR Settings
  getFRSettings(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/fr-settings/`);
  }

  // 3. Update Admin FR Settings (Admin Portal)
  updateFRSettings(settings: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/fr-settings/`, settings);
  }
}