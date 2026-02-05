import { Component, Input, forwardRef, inject } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { NgIf, NgClass } from '@angular/common';
import { AuthIconComponent, AuthIconName } from '../auth-icon/auth-icon.component';
import { MascaraService } from '../../servicos/mascara.service';
import { TipoMascara } from '../../tipos/mascara.types';

@Component({
  selector: 'app-campo-formulario',
  standalone: true,
  imports: [NgIf, NgClass, AuthIconComponent],
  templateUrl: './campo-formulario.component.html',
  styleUrls: ['./campo-formulario.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CampoFormularioComponent),
      multi: true,
    },
  ],
})
export class CampoFormularioComponent implements ControlValueAccessor {
  private servicoMascara = inject(MascaraService);

  @Input() label?: string;  // Nome do campo (ex: "CEP", "CPF")
  @Input() placeholder = '';
  @Input() type: 'text' | 'email' | 'password' | 'tel' = 'text';
  @Input() autocomplete: string = 'off';
  @Input() icon: AuthIconName = 'mail';
  @Input() error: string | null = null;
  @Input() maxlength?: number;
  @Input() showCounter = false;
  @Input() mascara?: TipoMascara;

  disabled = false;
  value = '';
  senhaVisivel = false;

  private onChange: (v: string) => void = () => {};
  private onTouched: () => void = () => {};

  /**
   * Placeholder dinâmico:
   * - Campo vazio: mostra o nome (label)
   * - Campo preenchido: mostra a máscara (placeholder)
   */
  get placeholderDinamico(): string {
    // Se tem valor, mostra placeholder com máscara
    if (this.value) {
      return this.placeholder;
    }
    // Se não tem valor, mostra o nome do campo
    return this.label || this.placeholder;
  }

  writeValue(v: string): void {
    this.value = v ?? '';
  }

  registerOnChange(fn: (v: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInput(ev: Event) {
    const input = ev.target as HTMLInputElement;
    let valorDigitado = input.value;

    // 🎭 Aplica máscara se configurada
    if (this.mascara) {
      valorDigitado = this.servicoMascara.aplicar(valorDigitado, this.mascara);
    }

    // 🔒 Limita caracteres se necessário
    if (this.maxlength && valorDigitado.length > this.maxlength) {
      valorDigitado = valorDigitado.substring(0, this.maxlength);
    }

    // Atualiza valor visual
    this.value = valorDigitado;
    
    // Envia valor SEM máscara para o formulário
    const valorLimpo = this.mascara 
      ? this.servicoMascara.remover(valorDigitado)
      : valorDigitado;
    
    this.onChange(valorLimpo);
    
    // Atualiza o input visualmente
    input.value = valorDigitado;
  }

  blur() {
    this.onTouched();
  }

  toggleSenha() {
    this.senhaVisivel = !this.senhaVisivel;
  }

  get inputType() {
    if (this.type !== 'password') return this.type;
    return this.senhaVisivel ? 'text' : 'password';
  }

  get rightIcon(): AuthIconName {
    return this.senhaVisivel ? 'eyeOff' : 'eye';
  }

  get contadorTexto(): string {
    if (!this.maxlength) return '';
    return `${this.value.length}/${this.maxlength}`;
  }

  get contadorClasse(): string {
    if (!this.maxlength) return '';
    const porcentagem = (this.value.length / this.maxlength) * 100;
    if (porcentagem >= 100) return 'no-limite';
    if (porcentagem >= 90) return 'perto-limite';
    return '';
  }
}