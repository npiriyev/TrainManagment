import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(private authService: AuthService){}
  
  @Output() close = new EventEmitter<void>();
  @Output() sign = new EventEmitter<{email: string, password: string}>();
  
  onClose(): void {
    this.close.emit();
    this.errorMessage = ''; // Clear error message when closing
  }
  
  onSign(): void {
    if (this.email && this.password) {
      this.isLoading = true;
      this.errorMessage = ''; // Clear previous errors
      
      this.authService.sign({
        email: this.email,
        password: this.password
      }).subscribe({
        next: (response) => {
          console.log('Signup successful');
          this.authService.closeSignupModal();
          this.isLoading = false;
          // Maybe navigate to a protected route
        },
        error: (error) => {
          console.error('Signup failed', error);
          this.isLoading = false;
          
          // Handle server errors
          if (error.error && typeof error.error === 'object') {
            // Handle ASP.NET Identity error format
            if (Array.isArray(error.error.errors)) {
              // Combined error messages from array
              this.errorMessage = error.error.errors
                .map((err: any) => err.description || err.message)
                .join('. ');
            } else if (error.error.message) {
              // Single error message
              this.errorMessage = error.error.message;
            } else if (typeof error.error === 'string') {
              // Plain string error
              this.errorMessage = error.error;
            } else {
              // Default error handling if structure is unknown
              this.errorMessage = error.message || 'An error occurred during sign up';
            }
          } else {
            // Generic error message as fallback
            this.errorMessage = error.message || 'Failed to create account. Please try again.';
          }
        }
      });
    }
  }

  ngOnInit() {
    console.log('Sign component initialized and rendering');
  }
}