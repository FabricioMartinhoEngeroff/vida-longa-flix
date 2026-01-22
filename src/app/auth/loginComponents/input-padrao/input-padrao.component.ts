import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-input-padrao',
  standalone: true,
  templateUrl: './input-padrao.component.html',
  styleUrls: ['./input-padrao.component.css'],
})
export class InputPadraoComponent {
  @Input() type: string = 'text';
  @Input() placeholder: string = '';
  @Input() name: string = '';
  @Input() value: string = '';

  @Output() valueChange = new EventEmitter<string>();

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.valueChange.emit(target.value);
  }
}
