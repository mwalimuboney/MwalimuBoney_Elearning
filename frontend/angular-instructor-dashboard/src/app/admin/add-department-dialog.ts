import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Define the shape of your Department data
export interface Department {
  id?: number;
  name: string;
  head_of_department?: string;
  description?: string;
  school_id: number;
}

@Injectable({
  providedIn: 'root'
})
export class AddDepartmentService {
  // Use your actual Django API URL
  private apiUrl = 'http://127.0.0.1:8000/api/departments/';

  constructor(private http: HttpClient) { }

  /**
   * POST: Create a new department on the server
   */
  createDepartment(departmentData: Department): Observable<Department> {
    // Django usually expects a trailing slash /
    return this.http.post<Department>(this.apiUrl, departmentData);
  }

  /**
   * GET: Retrieve all departments (optional helper)
   */
  getDepartments(): Observable<Department[]> {
    return this.http.get<Department[]>(this.apiUrl);
  }
}