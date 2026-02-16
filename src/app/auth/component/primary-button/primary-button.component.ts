import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-primary-button',
  standalone: true,
  templateUrl: './primary-button.component.html',
  styleUrls: ['./primary-button.component.css'],
})
export class PrimaryButtonComponent {

  @Input() text: string = 'Submit';
  @Input() disabled: boolean = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'submit';
}