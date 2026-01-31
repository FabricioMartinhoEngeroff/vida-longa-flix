import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-mensagem-erro',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="mensagem" [class.visivel]="visivel">
      <mat-icon>error</mat-icon>
      <span>{{ texto }}</span>
    </div>
  `,
  styles: [`
    mensagem {
  position: fixed;
  bottom: 40px;           /* ← MUDOU */
  left: 50%;              /* ← MUDOU */
  transform: translateX(-50%) translateY(20px);  /* ← MUDOU */

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;

  padding: 15px 16px;
  background: #dc2626;
  color: white;

  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);

  font-size: 16px;
  font-weight: 900;

  min-width: 320px;
  max-width: 520px;

  opacity: 0;
  visibility: hidden;

  transition: all 0.4s ease;
  z-index: 99999;
}

.mensagem.visivel {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(0);  /* ← MUDOU */
}

    .mensagem mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
      flex-shrink: 0;
    }

    @media (max-width: 768px) {
      .mensagem {
        right: 12px;
        left: 12px;
        top: 70px;

        min-width: auto;
        max-width: calc(100% - 24px);

        padding: 16px 16px;
        font-size: 15px;
      }

      .mensagem mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }
    }
  `]
})
export class MensagemErroComponent {
  @Input() visivel = false;
  @Input() texto = 'Erro!';
}
