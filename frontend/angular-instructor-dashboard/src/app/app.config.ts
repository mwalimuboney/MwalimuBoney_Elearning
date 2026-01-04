import { ApplicationConfig } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async'; // Modern standard
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { routes } from './app.routes';
import { TokenInterceptor } from './core/auth/token.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // 1. Modern Animations (Fixes deprecation & improves Material performance)
    provideAnimationsAsync(), 

    // 2. Router with Input Binding (Allows @Input() id in AttemptReviewComponent)
    provideRouter(routes, withComponentInputBinding()), 

    // 3. Hydration & Event Replay (SEO & UX for Server-Side Rendering)
    provideClientHydration(withEventReplay()),

    // 4. Secure HttpClient Configuration
    provideHttpClient(withInterceptorsFromDi()),

    // 5. Global Token Interceptor (Attaches JWT to every Django request)
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    }
  ]
};