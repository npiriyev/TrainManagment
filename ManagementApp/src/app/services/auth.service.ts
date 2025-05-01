import { Injectable, signal, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments';

interface User {
  userId: string;
  email: string;
}

interface AuthResponse {
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private tokenKey = 'auth_token';
  
  // UI related signals
  showLoginModal = signal(false);
  showSignupModal = signal(false);
  
  // Authentication state
  public currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  isAuthenticated = signal(false);
  authSuccess = new EventEmitter<void>();
  
  constructor(private http: HttpClient) {
    this.checkAuthStatus();
  }
  
  // Check if user is already authenticated
  private checkAuthStatus(): void {
    const token = localStorage.getItem(this.tokenKey);
    if (token) {
      try {
        // Decode the JWT token to get user info
        const user = this.parseJwt(token);
        if (user && this.isTokenValid(user)) {
          this.currentUserSubject.next(user);
          this.isAuthenticated.set(true);
        } else {
          this.logout(); // Token expired or invalid
        }
      } catch (e) {
        this.logout();
      }
    }
  }
  

  private parseJwt(token: string): User | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const payload = JSON.parse(jsonPayload);

      const email = payload.email || 
                   payload.unique_name || 
                   payload.name ||
                   payload.sub;
                   
      const userId = payload.sub || 
                    payload.nameid || 
                    payload.jti;
      
      
      return {
        userId: userId || 'unknown',
        email: email || 'unknown@example.com'
      };
    } catch (e) {
      console.error('Error parsing JWT:', e);
      return null;
    }
  }
  
  // Check if token is not expired
  private isTokenValid(user: any): boolean {
    if (!user.exp) return true; // No expiration
    const expirationDate = new Date(user.exp * 1000);
    return expirationDate > new Date();
  }
  
  // Register new user
  register(credentials: {email: string, password: string}): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/Account/Register`, credentials)
      .pipe(
        tap(response => this.handleAuthentication(response.token)),
        catchError(this.handleError)
      );
  }



  login(credentials: {email: string, password: string}): Observable<AuthResponse> {
    console.log('Attempting login with:', credentials);
    
    return this.http.post<AuthResponse>(`${this.apiUrl}/Account/Login`, credentials)
      .pipe(
        tap(response => {
          console.log('Login response received:', response);
          this.handleAuthentication(response.token);
        }),
        catchError(error => {
          console.error('Login error:', error);
          return this.handleError(error);
        })
      );
  }
  
  // Handle successful authentication
  private handleAuthentication(token: string): void {
    localStorage.setItem(this.tokenKey, token);
    const user = this.parseJwt(token);
    this.currentUserSubject.next(user);
    this.isAuthenticated.set(true);
    
    // Add a small delay before emitting the event
    setTimeout(() => {
      console.log('Auth successful, emitting event');
      this.authSuccess.emit();
    }, 500);
  }
  
  // Logout user
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.currentUserSubject.next(null);
    this.isAuthenticated.set(false);
  }
  
  // Get the auth token for API requests
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }
  
  // Handle API errors
  private handleError(error: any): Observable<never> {
    let errorMessage = 'An unknown error occurred';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = error.error?.message || error.statusText;
    }
    return throwError(() => new Error(errorMessage));
  }
  
  // UI methods
  openLoginModal(): void {
    this.showLoginModal.set(true);
  }
  
  closeLoginModal(): void {
    this.showLoginModal.set(false);
  }
  
  openSignupModal(): void {
    this.showSignupModal.set(true);
  }
  
  closeSignupModal(): void {
    this.showSignupModal.set(false);
  }

  sign(credentials: {email: string, password: string}): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/Account/Register`, credentials)
      .pipe(
        tap(response => {
          console.log('Login response received:', response);
          this.handleAuthentication(response.token);
        }),
        catchError(error => {
          console.error('Login error:', error);
          return this.handleError(error);
        })
      );
  }
}
