import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

export type EmailErrorType = 'temporary' | 'suspicious' | 'invalid' | 'suggestion' | null;

interface ErrorConfig {
  icon: string;
  color: string;
  title: string;
  message: string;
}

@Component({
  selector: 'app-email-adjustment-message',
  standalone: true,
  imports: [MatIconModule],
  template: `
    @if (errorType) {
      <div class="email-message" [class]="'type-' + errorType">
        <div class="header">
          <mat-icon>{{ config.icon }}</mat-icon>
          <span class="title">{{ config.title }}</span>
        </div>
        
        <p class="message">{{ customMessage || config.message }}</p>
        
        @if (suggestedEmail) {
          <div class="suggestions">
            <p class="label">Você quis dizer:</p>
            <button class="suggestion-btn" (click)="selectSuggestion()">
              <mat-icon>edit</mat-icon>
              <span>{{ suggestedEmail }}</span>
            </button>
          </div>
        }

        @if (showActions) {
          <div class="actions">
            <button class="secondary-btn" (click)="dismiss()">
              Continuar mesmo assim
            </button>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .email-message {
      margin-top: 8px;
      padding: 12px 16px;
      border-radius: 8px;
      border-left: 4px solid;
      background: #f9fafb;
      animation: slideDown 0.3s ease;
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }

    .header mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .title {
      font-size: 14px;
      font-weight: 600;
    }

    .message {
      margin: 0 0 12px 0;
      font-size: 13px;
      line-height: 1.5;
      color: #6b7280;
    }

    /* Cores por tipo de erro */
    .type-temporary {
      border-left-color: #dc2626;
      background: #fef2f2;
    }

    .type-temporary .header {
      color: #dc2626;
    }

    .type-suspicious {
      border-left-color: #f59e0b;
      background: #fffbeb;
    }

    .type-suspicious .header {
      color: #f59e0b;
    }

    .type-invalid {
      border-left-color: #ef4444;
      background: #fef2f2;
    }

    .type-invalid .header {
      color: #ef4444;
    }

    .type-suggestion {
      border-left-color: #3b82f6;
      background: #eff6ff;
    }

    .type-suggestion .header {
      color: #3b82f6;
    }

    .suggestions {
      margin-bottom: 12px;
    }

    .label {
      font-size: 12px;
      color: #6b7280;
      margin: 0 0 6px 0;
    }

    .suggestion-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      
      width: 100%;
      padding: 8px 12px;
      
      background: white;
      border: 2px solid #e5e7eb;
      border-radius: 6px;
      
      font-size: 14px;
      color: #3b82f6;
      font-weight: 500;
      
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .suggestion-btn:hover {
      border-color: #3b82f6;
      background: #eff6ff;
    }

    .suggestion-btn mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .actions {
      display: flex;
      gap: 8px;
    }

    .secondary-btn {
      padding: 6px 12px;
      background: transparent;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      
      font-size: 12px;
      color: #6b7280;
      font-weight: 500;
      
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .secondary-btn:hover {
      background: #f3f4f6;
      border-color: #9ca3af;
    }

    @media (max-width: 768px) {
      .email-message {
        padding: 10px 14px;
      }

      .title {
        font-size: 13px;
      }

      .message {
        font-size: 12px;
      }
    }
  `]
})
export class EmailAdjustmentMessageComponent {
  @Input() errorType: EmailErrorType = null;
  @Input() customMessage?: string;
  @Input() suggestedEmail?: string;
  @Input() showActions = false;
  @Input() problematicDomain?: string;

  @Output() suggestionSelected = new EventEmitter<string>();
  @Output() dismissed = new EventEmitter<void>();

  // Configurações de mensagens por tipo de erro
  private readonly configs: Record<Exclude<EmailErrorType, null>, ErrorConfig> = {
    temporary: {
      icon: 'block',
      color: '#dc2626',
      title: 'Email temporário detectado',
      message: 'Emails temporários ou descartáveis não são aceitos. Use um email pessoal ou profissional válido.'
    },
    suspicious: {
      icon: 'warning',
      color: '#f59e0b',
      title: 'Email suspeito',
      message: 'Este domínio de email não é reconhecido. Verifique se digitou corretamente.'
    },
    invalid: {
      icon: 'error',
      color: '#ef4444',
      title: 'Email inválido',
      message: 'O formato do email está incorreto ou o domínio não é válido.'
    },
    suggestion: {
      icon: 'info',
      color: '#3b82f6',
      title: 'Verificar email',
      message: 'Detectamos um possível erro de digitação no seu email.'
    }
  };

  get config(): ErrorConfig {
    return this.errorType ? this.configs[this.errorType] : this.configs.invalid;
  }

  // Emite sugestão selecionada para componente pai preencher campo
  selectSuggestion() {
    if (this.suggestedEmail) {
      this.suggestionSelected.emit(this.suggestedEmail);
    }
  }

  // Emite evento para componente pai ocultar mensagem
  dismiss() {
    this.dismissed.emit();
  }
}