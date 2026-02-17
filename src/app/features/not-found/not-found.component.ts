import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { TitleComponent} from '../../shared/components/title/title.component';

@Component({
  selector: 'app-not-found', // Se quiser, pode trocar para 'app-not-found'
  standalone: true,
  imports: [TitleComponent],
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.css'],
})
export class NotFoundComponent {
  // Injeta o Router para permitir navegação por código.
  constructor(private router: Router) {}

  // Redireciona o usuário para a página inicial.
  goToHome(): void {
    this.router.navigate(['/']);
  }
}
