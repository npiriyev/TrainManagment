import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  
  constructor(private authService: AuthService){}
  
  @Output() close = new EventEmitter<void>();
  @Output() login = new EventEmitter<{email: string, password: string}>();
  
  onClose(): void {
    this.close.emit();
    this.errorMessage = ''; // Clear error message when closing
  }
  
  onLogin(): void {
    if (this.email && this.password) {
      this.isLoading = true;
      this.errorMessage = ''; // Clear previous errors
      
      this.authService.login({
        email: this.email,
        password: this.password
      }).subscribe({
        next: (response) => {
          console.log('Login successful');
          
          // Close the modal first
          this.authService.closeLoginModal();
          
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Login failed', error);
          this.isLoading = false;
          
          // Enhanced error handling
          if (error.error) {
            if (typeof error.error === 'object' && error.error.message) {
              // Handle structured error with message property
              this.errorMessage = error.error.message;
            } else if (typeof error.error === 'string') {
              // Handle plain string error
              this.errorMessage = error.error;
            } else {
              // Default error message
              this.errorMessage = 'Invalid email or password';
            }
          } else if (error.status === 401) {
            // Specific handling for unauthorized status
            this.errorMessage = 'Invalid email or password';
          } else {
            // Generic error message as fallback
            this.errorMessage = error.message || 'Login failed';
          }
        }
      });
    }
  }
}