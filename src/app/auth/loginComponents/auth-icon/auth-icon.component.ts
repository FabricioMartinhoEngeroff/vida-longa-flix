import { Component, Input } from '@angular/core';
import { NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';

export type AuthIconName =
  | 'mail'
  | 'lock'
  | 'user'
  | 'id'
  | 'phone'
  | 'pin'
  | 'home'
  | 'city'
  | 'globe'
  | 'hash'
  | 'eye'
  | 'eyeOff';

@Component({
  selector: 'app-auth-icon',
  standalone: true,
  imports: [NgSwitch, NgSwitchCase, NgSwitchDefault],
  template: `
    <span class="icon" [attr.aria-hidden]="true" [ngSwitch]="name">
      <!-- MAIL -->
      <svg *ngSwitchCase="'mail'" viewBox="0 0 24 24" fill="none">
        <path d="M4 6.5h16v11H4v-11Z" stroke="currentColor" stroke-width="1.8" />
        <path d="M4.5 7l7.5 6 7.5-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>

      <!-- LOCK -->
      <svg *ngSwitchCase="'lock'" viewBox="0 0 24 24" fill="none">
        <path d="M7 11V8.5a5 5 0 0 1 10 0V11" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M6.5 11h11v9h-11v-9Z" stroke="currentColor" stroke-width="1.8" />
      </svg>

      <!-- USER -->
      <svg *ngSwitchCase="'user'" viewBox="0 0 24 24" fill="none">
        <path d="M12 12a4.2 4.2 0 1 0-0.001-8.401A4.2 4.2 0 0 0 12 12Z" stroke="currentColor" stroke-width="1.8"/>
        <path d="M4.5 20c1.7-3.3 5-5 7.5-5s5.8 1.7 7.5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      </svg>

      <!-- ID -->
      <svg *ngSwitchCase="'id'" viewBox="0 0 24 24" fill="none">
        <path d="M4 7.5h16v11H4v-11Z" stroke="currentColor" stroke-width="1.8"/>
        <path d="M8 12.5h4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M8 15.5h7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M7.5 10.3h.01" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
      </svg>

      <!-- PHONE -->
      <svg *ngSwitchCase="'phone'" viewBox="0 0 24 24" fill="none">
        <path d="M8 4.5 6.5 6c-1 1-1 2.7 0 4.7 1.8 3.6 4.2 6 7.8 7.8 2 1 3.7 1 4.7 0L19.5 16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M14.5 6.5c2 0 3.5 1.5 3.5 3.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      </svg>

      <!-- PIN -->
      <svg *ngSwitchCase="'pin'" viewBox="0 0 24 24" fill="none">
        <path d="M12 21s7-6 7-12a7 7 0 1 0-14 0c0 6 7 12 7 12Z" stroke="currentColor" stroke-width="1.8"/>
        <path d="M12 11.5a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4Z" stroke="currentColor" stroke-width="1.8"/>
      </svg>

      <!-- HOME -->
      <svg *ngSwitchCase="'home'" viewBox="0 0 24 24" fill="none">
        <path d="M4.5 11 12 4.5 19.5 11V20H4.5V11Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
      </svg>

      <!-- CITY -->
      <svg *ngSwitchCase="'city'" viewBox="0 0 24 24" fill="none">
        <path d="M5 20V6h8v14" stroke="currentColor" stroke-width="1.8"/>
        <path d="M13 20v-9h6v9" stroke="currentColor" stroke-width="1.8"/>
      </svg>

      <!-- GLOBE -->
      <svg *ngSwitchCase="'globe'" viewBox="0 0 24 24" fill="none">
        <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" stroke="currentColor" stroke-width="1.8"/>
        <path d="M3 12h18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M12 3c2.6 2.7 2.6 15.3 0 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      </svg>

      <!-- HASH (número) -->
      <svg *ngSwitchCase="'hash'" viewBox="0 0 24 24" fill="none">
        <path d="M9 3 7 21" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M17 3 15 21" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M5 9h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M3 15h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      </svg>

      <!-- EYE -->
      <svg *ngSwitchCase="'eye'" viewBox="0 0 24 24" fill="none">
        <path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z" stroke="currentColor" stroke-width="1.8"/>
        <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" stroke-width="1.8"/>
      </svg>

      <!-- EYE OFF -->
      <svg *ngSwitchCase="'eyeOff'" viewBox="0 0 24 24" fill="none">
        <path d="M4 4l16 16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M2.5 12s3.5-7 9.5-7c2.1 0 4 0.7 5.6 1.8M21.5 12s-3.5 7-9.5 7c-2.2 0-4.2-.7-5.8-2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M10 10a2.8 2.8 0 0 0 4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      </svg>

      <svg *ngSwitchDefault viewBox="0 0 24 24" fill="none">
        <path d="M12 12h.01" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
      </svg>
    </span>
  `,
  styles: [`
    .icon {
      display: inline-flex;
      width: 20px;
      height: 20px;
    }
    svg { width: 20px; height: 20px; }
  `]
})
export class AuthIconComponent {
  @Input() name: AuthIconName = 'mail';
}
