import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-campo-texto',
  templateUrl: './campo-texto.component.html',
  styleUrls: ['./campo-texto.component.css'],
  standalone: true,
})
export class CampoTextoComponent {
  @Input() placeholder = '';
  @Input() type = 'text';
  @Input() value = '';
  @Input() disabled = false;

  @Output() valueChange = new EventEmitter<string>();
  @Output() configuracaoClick = new EventEmitter<void>();

  onInput(event: Event) {
    if (this.disabled) return;

    const input = event.target as HTMLInputElement;
    const novoValor = input.value;

    this.value = novoValor;
    this.valueChange.emit(novoValor);
  }

  onConfiguracaoClick() {
    if (this.disabled) return;
    this.configuracaoClick.emit();
  }
}
