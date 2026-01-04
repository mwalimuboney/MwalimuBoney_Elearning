// src/app/core/auth/token.interceptor.ts (Conceptual Code)

import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const accessToken = this.authService.getAccessToken();

    // Only attach the token if one exists and the request is going to our API
    if (accessToken && request.url.startsWith('http://localhost:8000/api')) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${accessToken}`
        }
      });
    }

    // You would typically add logic here to handle 401 errors and refresh the token.

    return next.handle(request);
  }
}