import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-campo-texto',
  templateUrl: './campo-texto.component.html',
  styleUrls: ['./campo-texto.component.css'],
  standalone: true,
})
export class CampoTextoComponent {
  /**
   * ✅ Props equivalentes ao React.InputHTMLAttributes<HTMLInputElement>
   *
   * No React você fazia:
   * <CampoTextoEstilizado {...props} />
   *
   * No Angular não existe {...props}, então a gente expõe Inputs
   * que são os mais comuns e úteis pra pesquisa.
   */
  @Input() placeholder: string = '';
  @Input() type: string = 'text';
  @Input() value: string = '';
  @Input() disabled: boolean = false;

  /**
   * ✅ Evento para "subir" o valor digitado (equivalente ao onChange do React)
   */
  @Output() valueChange = new EventEmitter<string>();

  /**
   * ✅ Evento do clique na engrenagem
   */
  @Output() configuracaoClick = new EventEmitter<void>();

  /**
   * Função que captura o input digitado
   * (equivalente ao onChange do React)
   */
  onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const novoValor = input.value;

    this.value = novoValor; // mantém sincronizado local
    this.valueChange.emit(novoValor); // emite para o componente pai
  }

  onConfiguracaoClick() {
    this.configuracaoClick.emit();
  }
}

