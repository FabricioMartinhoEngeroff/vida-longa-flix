import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { EmailErrorType } from '../../types/form.types';

@Component({
  selector: 'app-email-adjustment-message',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (message) {
      <p class="email-adjustment-message">{{ message }}</p>
    }
  `,
  styles: [
    `
      .email-adjustment-message {
        margin-top: 8px;
        font-size: 0.85rem;
        color: #b45309;
      }
    `,
  ],
})
export class EmailAdjustmentMessageComponent {
  @Input() errorType: EmailErrorType = null;
  @Input() customMessage?: string;
  @Input() problematicDomain?: string;

  get message(): string | null {
    if (this.customMessage) return this.customMessage;
    if (this.errorType === 'temporary') return 'Temporary email domains are not allowed.';
    if (this.errorType === 'suspicious') {
      return this.problematicDomain
        ? `Check the domain "${this.problematicDomain}" and try again.`
        : 'Please review the email domain and try again.';
    }
    if (this.errorType === 'invalid') return 'Enter a valid professional email.';
    if (this.errorType === 'suggestion') return 'Check if there is a typo in your email.';
    return null;
  }
}
