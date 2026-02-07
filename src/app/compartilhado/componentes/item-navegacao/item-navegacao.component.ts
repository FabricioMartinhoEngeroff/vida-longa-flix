import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgClass } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-item-navegacao',
  standalone: true,
  imports: [NgClass, MatIconModule ],
  templateUrl: './item-navegacao.component.html',
  styleUrls: ['./item-navegacao.component.css'],
})
export class ItemNavegacaoComponent {
  @Input() texto = '';
  @Input() icone = '';
  @Input() ativo = false;

  @Output() aoClicar = new EventEmitter<void>();

  clicar() {
    this.aoClicar.emit();
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.clicar();
    }
  }
}
