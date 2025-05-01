import { Component, signal } from '@angular/core';
import { ListviewComponent } from '../listview/listview.component';
import { AuthService } from '../services/auth.service';
import { LoginComponent } from '../components/login/login.component';
import { CommonModule } from '@angular/common';
import { SignupComponent } from '../components/signup/signup.component';

@Component({
  selector: 'app-home',
  standalone:true,
  imports: [CommonModule, ListviewComponent, SignupComponent, LoginComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  

  constructor(public authService: AuthService) {}



}
