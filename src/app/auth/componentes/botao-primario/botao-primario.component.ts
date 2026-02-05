import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-botao-primario',
  standalone: true,
  templateUrl: './botao-primario.component.html',
  styleUrls: ['./botao-primario.component.css'],
})

export class BotaoPrimarioComponent {
  @Input() text: string = 'Entrar';
  @Input() disabled: boolean = false;
  @Input() type: 'button' | 'submit' = 'submit';

  @Output() aoClicar = new EventEmitter<void>();

  clicar(): void {
    if (this.disabled) return;
    this.aoClicar.emit();
  }
}
