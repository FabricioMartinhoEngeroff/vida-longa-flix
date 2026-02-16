import { Component, Input, OnChanges } from '@angular/core';
import { calculatePasswordStrength, PasswordStrengthResult } from '../../utils/strong-password-validator';

@Component({
  selector: 'app-password-strength-indicator',
  standalone: true,
  imports: [],
  templateUrl: './password-strength-indicator.component.html',
  styleUrl: './password-strength-indicator.component.css'
})
export class PasswordStrengthIndicatorComponent implements OnChanges {
 
  @Input() password = '';
  @Input() showRequirements = true;

  result: PasswordStrengthResult = calculatePasswordStrength('');

  ngOnChanges() {
    this.result = calculatePasswordStrength(this.password);
  }
}