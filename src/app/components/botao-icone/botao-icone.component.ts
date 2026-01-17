import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-botao-icone',
  standalone: true,
  templateUrl: './botao-icone.component.html',
  styleUrls: ['./botao-icone.component.css'],
})
export class BotaoIconeComponent {
  @Output() aoClicar = new EventEmitter<void>();

  clicar() {
    this.aoClicar.emit();
  }
}
