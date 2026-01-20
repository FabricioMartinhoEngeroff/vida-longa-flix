import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-campo-formulario',
  standalone: true,
  imports: [NgIf, FormsModule],
  templateUrl: './campo-formulario.component.html',
  styleUrls: ['./campo-formulario.component.css'],
})
export class CampoFormularioComponent {
  /** texto/label do campo */
  @Input() placeholder: string = '';

  /** nome e id do input */
  @Input() name: string = '';
  @Input() id: string = '';

  /** tipo do input */
  @Input() type: string = 'text';

  /** valor */
  @Input() value: string = '';

  /** autocomplete */
  @Input() autocomplete: string = 'off';

  /** se é campo de senha (habilita olhinho) */
  @Input() campoSenha: boolean = false;

  /** mensagem de erro */
  @Input() error: string | null = null;

  /** ícone à esquerda (pode ser emoji ou texto) */
  @Input() iconeEsquerda: string = '';

  /** output equivalente ao onChange */
  @Output() valueChange = new EventEmitter<string>();

  senhaVisivel: boolean = false;

  alternarVisibilidadeSenha(): void {
    this.senhaVisivel = !this.senhaVisivel;
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.valueChange.emit(target.value);
  }

  get inputType(): string {
    if (this.campoSenha) {
      return this.senhaVisivel ? 'text' : 'password';
    }
    return this.type;
  }
}
