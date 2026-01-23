import { Component, Input, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { NgIf } from '@angular/common';
import { AuthIconComponent, AuthIconName } from '../auth-icon/auth-icon.component';

@Component({
  selector: 'app-campo-formulario',
  standalone: true,
  imports: [NgIf, AuthIconComponent],
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
  @Input() placeholder = '';
  @Input() type: 'text' | 'email' | 'password' | 'tel' = 'text';
  @Input() autocomplete: string = 'off';

  /** nome do ícone (SVG) */
  @Input() icon: AuthIconName = 'mail';

  /** erro (texto) vindo do componente pai */
  @Input() error: string | null = null;

  disabled = false;
  value = '';

  senhaVisivel = false;

  private onChange: (v: string) => void = () => {};
  private onTouched: () => void = () => {};

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
    const v = (ev.target as HTMLInputElement).value;
    this.value = v;
    this.onChange(v);
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
}
