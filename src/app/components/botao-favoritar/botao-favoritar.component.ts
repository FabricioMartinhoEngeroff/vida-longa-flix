import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-botao-favoritar',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './botao-favoritar.component.html',
  styleUrls: ['./botao-favoritar.component.css'],
})
export class BotaoFavoritarComponent {
  @Input() favorito: boolean = false;

  @Output() aoClicar = new EventEmitter<void>();

  clicar(): void {
    this.aoClicar.emit();
  }
}
