import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  title = signal('Train Component Management');

  constructor(public authService: AuthService) {}
  
  openLoginModal(): void {
    console.log("log clicked");
    this.authService.openLoginModal();
  }

  openSignModal(): void {
    console.log("sign clicked");
    this.authService.openSignupModal();
  }
  
  logout(): void {
    this.authService.logout();
  }
  
  get userEmail(): string | undefined {
    console.log(this.authService.currentUserSubject.getValue()?.email);
    return this.authService.currentUserSubject.getValue()?.email;
  }
}