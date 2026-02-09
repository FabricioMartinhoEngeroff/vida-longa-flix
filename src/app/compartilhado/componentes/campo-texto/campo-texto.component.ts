import { Component, EventEmitter, Input, Output, ViewChild, ElementRef } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-campo-texto',
  templateUrl: './campo-texto.component.html',
  styleUrls: ['./campo-texto.component.css'],
  standalone: true,
  imports: [MatIconModule],
})
export class CampoTextoComponent {
  @Input() placeholder = '';
  @Input() type = 'text';
  @Input() value = '';
  @Input() disabled = false;

  @Output() valueChange = new EventEmitter<string>();

  @ViewChild('inputEl') inputEl?: ElementRef<HTMLInputElement>;
  aberto = false;

  onInput(event: Event) {
    if (this.disabled) return;
    const input = event.target as HTMLInputElement;
    this.value = input.value;
    this.valueChange.emit(this.value);
  }

  toggleBusca() {
    if (this.disabled) return;
    this.aberto = !this.aberto;
    if (this.aberto) {
      setTimeout(() => this.inputEl?.nativeElement.focus(), 0);
    }
  }

  fecharSeVazio() {
    if (!this.value?.trim()) this.aberto = false;
  }

}
