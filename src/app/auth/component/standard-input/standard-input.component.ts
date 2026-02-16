import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-standard-input',
  standalone: true,
  templateUrl: './standard-input.component.html',
  styleUrls: ['./standard-input.component.css'],
})
export class StandardInputComponent {
  
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