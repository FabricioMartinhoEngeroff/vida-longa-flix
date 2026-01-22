import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoginComponent } from '../login/login.component';
import { RegistrarComponent } from '../registrar/registrar.component';

@Component({
  selector: 'app-autorizacao',
  standalone: true,
  imports: [CommonModule, LoginComponent, RegistrarComponent],
  templateUrl: './autorizacao.component.html',
  styleUrl: './autorizacao.component.css',
})

export class AutorizacaoComponent {
  isRegistering = false;

  alternarModo() {
    this.isRegistering = !this.isRegistering;
  }
}
