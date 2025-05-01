import { HttpInterceptorFn, HttpEvent, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>, 
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // Get the auth token
  const token = authService.getToken();

  // Clone the request and add the authorization header if token exists
  if (token) {
    console.log('Token found, adding to request:', token.substring(0, 15) + '...');
    
    // Clone request with Authorization header
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    
    // List all headers to verify the Authorization header is set correctly
    console.log('Request headers:', authReq.headers.keys().join(', '));
    
    // Pass the cloned request with the token to the next handler
    return next(authReq).pipe(
      catchError(error => {
        // Handle 401 Unauthorized errors
        if (error.status === 401) {
          console.log('401 Unauthorized error - logging out');
          authService.logout();
          router.navigate(['/login']); // Redirect to login
        }
        return throwError(() => error);
      })
    );
  }
  
  // If no token, just pass the original request
  return next(req);
};