import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-campo-texto',
  templateUrl: './campo-texto.component.html',
  styleUrls: ['./campo-texto.component.css'],
  standalone: true,
})
export class CampoTextoComponent {

  @Input() placeholder: string = '';
  @Input() type: string = 'text';
  @Input() value: string = '';
  @Input() disabled: boolean = false;

  @Output() valueChange = new EventEmitter<string>();
  @Output() configuracaoClick = new EventEmitter<void>();

  onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const novoValor = input.value;

    this.value = novoValor; 
    this.valueChange.emit(novoValor); 
  }

  onConfiguracaoClick() {
    this.configuracaoClick.emit();
  }
}

