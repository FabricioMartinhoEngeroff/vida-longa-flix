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
  <mat-icon>check_circle</mat-icon>
  <span>{{ texto }}</span>
  <button class="btn-fechar" (click)="fechar()">
    <mat-icon>close</mat-icon>
  </button>
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

  /* ✅ BOTÃO X - FORA DO MEDIA QUERY */
  .btn-fechar {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    border-radius: 50%;
    color: white;
    cursor: pointer;

    width: 32px;
    height: 32px;

    display: flex;
    align-items: center;
    justify-content: center;

    padding: 0;
    flex-shrink: 0;

    transition: all 0.2s ease;
  }

  .btn-fechar:hover {
    background: rgba(255, 255, 255, 0.35);
    transform: scale(1.1);
  }

  .btn-fechar:active {
    transform: scale(0.95);
  }

  .btn-fechar mat-icon {
    font-size: 20px;
    width: 20px;
    height: 20px;
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
   private timeoutId?: any;

  constructor(private notificacaoService: NotificacaoService) {}

ngOnInit() {
  this.subscription = this.notificacaoService.notificacao$.subscribe(notif => {
    if (notif.tipo === 'aviso') {
      this.texto = notif.texto;
      this.visivel = true;
      
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
      }
      
      this.timeoutId = setTimeout(() => {
        this.visivel = false;
      }, 4000);
    }
  });
}

fechar() {
  this.visivel = false;
  if (this.timeoutId) {
    clearTimeout(this.timeoutId);
  }
}

ngOnDestroy() {
  this.subscription?.unsubscribe();
  if (this.timeoutId) {
    clearTimeout(this.timeoutId);
  }
}
}