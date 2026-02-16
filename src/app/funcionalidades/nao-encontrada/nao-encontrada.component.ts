import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { TituloComponent } from '../../shared/components/title/title.component';

@Component({
  selector: 'app-nao-encontrada',
  standalone: true,
  imports: [TituloComponent],
  templateUrl: './nao-encontrada.component.html',
  styleUrls: ['./nao-encontrada.component.css'],
})
export class NaoEncontradaComponent {
  constructor(private router: Router) {}

  voltarInicio(): void {
    this.router.navigate(['/']);
  }
}
