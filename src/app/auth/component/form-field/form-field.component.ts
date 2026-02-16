import { Component, Input, forwardRef, inject } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { NgClass } from '@angular/common';
import { AuthIconComponent, AuthIconName } from '../auth-icon/auth-icon.component';
import { MaskService } from '../../services/mask.service';
import { MaskType } from '../../types/form.types';

@Component({
  selector: 'app-form-field',
  standalone: true,
  imports: [NgClass, AuthIconComponent],
  templateUrl: './form-field.component.html',
  styleUrls: ['./form-field.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormFieldComponent),
      multi: true,
    },
  ],
})
export class FormFieldComponent implements ControlValueAccessor {
  private maskService = inject(MaskService);

  @Input() label?: string;
  @Input() placeholder = '';
  @Input() type: 'text' | 'email' | 'password' | 'tel' = 'text';
  @Input() autocomplete: string = 'off';
  @Input() icon: AuthIconName = 'mail';
  @Input() error: string | null = null;
  @Input() maxlength?: number;
  @Input() showCounter = false;
  @Input() mask?: MaskType;

  disabled = false;
  value = '';
  passwordVisible = false;

  private onChange: (v: string) => void = () => {};
  private onTouched: () => void = () => {};

  get dynamicPlaceholder(): string {
    if (this.value) {
      return this.placeholder;
    }
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
    let typedValue = input.value;

    if (this.mask) {
      typedValue = this.maskService.apply(typedValue, this.mask);
    }

    if (this.maxlength && typedValue.length > this.maxlength) {
      typedValue = typedValue.substring(0, this.maxlength);
    }

    this.value = typedValue;
    
    const cleanValue = this.mask 
      ? this.maskService.remove(typedValue)
      : typedValue;
    
    this.onChange(cleanValue);
    
    input.value = typedValue;
  }

  blur() {
    this.onTouched();
  }

  togglePassword() {
    this.passwordVisible = !this.passwordVisible;
  }

  get inputType() {
    if (this.type !== 'password') return this.type;
    return this.passwordVisible ? 'text' : 'password';
  }

  get rightIcon(): AuthIconName {
    return this.passwordVisible ? 'eyeOff' : 'eye';
  }

  get counterText(): string {
    if (!this.maxlength) return '';
    return `${this.value.length}/${this.maxlength}`;
  }

  get counterClass(): string {
    if (!this.maxlength) return '';
    const percentage = (this.value.length / this.maxlength) * 100;
    if (percentage >= 100) return 'at-limit';
    if (percentage >= 90) return 'near-limit';
    return '';
  }
}