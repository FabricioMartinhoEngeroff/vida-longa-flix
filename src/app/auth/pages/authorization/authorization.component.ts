import { Component } from '@angular/core';
import { LoginComponent } from '../login/login.component';
import { RegisterComponent } from '../register/register.component';

@Component({
  selector: 'app-authorization',
  standalone: true,
  imports: [LoginComponent, RegisterComponent],
  templateUrl: './authorization.component.html',
  styleUrl: './authorization.component.css',
})
export class AuthorizationComponent {
 
  isRegistering = false;

  toggleMode() {
    this.isRegistering = !this.isRegistering;
  }
}