import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';
import { NotificacaoService } from '../../servicos/mensagem-alerta/mensagem-alerta.service';

@Component({
  selector: 'app-mensagem-aviso',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="mensagem" [class.visivel]="visivel">
      <mat-icon>warning</mat-icon>
      <span>{{ texto }}</span>
    </div>
  `,
  styles: [`
    .mensagem {
      position: fixed;
      bottom: 40px;
      left: 50%;
      transform: translateX(-50%) translateY(20px);

      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;

      padding: 15px 24px;
      background: #f59e0b;
      color: white;

      border-radius: 12px;
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);

      font-size: 16px;
      font-weight: 600;

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
      transform: translateX(-50%) translateY(0);
    }

    .mensagem mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
      flex-shrink: 0;
    }

    @media (max-width: 768px) {
      .mensagem {
        min-width: 300px;
        max-width: 90%;
        padding: 16px 20px;
        font-size: 15px;
        bottom: 20px;
      }

      .mensagem mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }
    }
  `]
})
export class MensagemAvisoComponent implements OnInit, OnDestroy {
  visivel = false;
  texto = '';
  private subscription?: Subscription;

  constructor(private notificacaoService: NotificacaoService) {}

  ngOnInit() {
    this.subscription = this.notificacaoService.notificacao$.subscribe(notif => {
      if (notif.tipo === 'aviso') {
        this.texto = notif.texto;
        this.visivel = true;
        
        setTimeout(() => {
          this.visivel = false;
        }, 3000);
      }
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}