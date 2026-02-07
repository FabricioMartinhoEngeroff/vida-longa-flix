import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';
import { NotificacaoService } from '../../servicos/mensagem-alerta/mensagem-alerta.service';

@Component({
  selector: 'app-mensagem-info',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="mensagem" [class.visivel]="visivel" *ngIf="visivel">
      <div class="conteudo">
        <mat-icon>info</mat-icon>
        <div class="texto-container">
          <strong>{{ titulo }}</strong>
          <span>{{ texto }}</span>
        </div>
      </div>
      <button class="btn-fechar" (click)="fechar()" type="button">
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
      justify-content: space-between;
      gap: 16px;
      
      padding: 15px 24px;
      background: #3b82f6;
      color: white;
      
      border-radius: 12px;
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
      
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
    
    .conteudo {
      display: flex;
      align-items: center;
      gap: 16px;
      flex: 1;
    }
    
    .conteudo > mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
      flex-shrink: 0;
    }
    
    .texto-container {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    .texto-container strong {
      font-size: 16px;
      font-weight: 700;
    }
    
    .texto-container span {
      font-size: 14px;
      font-weight: 400;
    }
    
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
export class MensagemInfoComponent implements OnInit, OnDestroy {
  visivel = false;
  titulo = '';
  texto = '';
  private subscription?: Subscription;
  private timeoutId?: any;

  constructor(private notificacaoService: NotificacaoService) {}

  ngOnInit() {
    this.subscription = this.notificacaoService.notificacao$.subscribe(notif => {
      if (notif.tipo === 'info') {
        this.titulo = notif.titulo;
        this.texto = notif.texto;
        this.visivel = true;
        
        // Limpa timeout anterior se existir
        if (this.timeoutId) {
          clearTimeout(this.timeoutId);
        }
        
        // 4 segundos conforme padrão da empresa
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