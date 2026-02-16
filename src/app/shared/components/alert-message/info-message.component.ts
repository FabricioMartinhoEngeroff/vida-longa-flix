import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';
import { NotificationService } from '../../services/alert-message/alert-message.service';

@Component({
  selector: 'app-info-message',
  standalone: true,
  imports: [MatIconModule],
  template: `
    @if (visible) {
      <div class="message visible">
        <div class="content">
          <mat-icon>info</mat-icon>
          <div class="text-container">
            <strong>{{ title }}</strong>
            <span>{{ text }}</span>
          </div>
        </div>
        <button class="close-btn" (click)="close()" type="button">
          <mat-icon>close</mat-icon>
        </button>
      </div>
    }
  `,
  styles: [`
    .message {
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
    
    .message.visible {
      opacity: 1;
      visibility: visible;
      transform: translateX(-50%) translateY(0);
    }
    
    .content {
      display: flex;
      align-items: center;
      gap: 16px;
      flex: 1;
    }
    
    .content > mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
      flex-shrink: 0;
    }
    
    .text-container {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    .text-container strong {
      font-size: 16px;
      font-weight: 700;
    }
    
    .text-container span {
      font-size: 14px;
      font-weight: 400;
    }
    
    .close-btn {
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

    .close-btn:hover {
      background: rgba(255, 255, 255, 0.35);
      transform: scale(1.1);
    }

    .close-btn:active {
      transform: scale(0.95);
    }

    .close-btn mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }
    
    @media (max-width: 768px) {
      .message {
        min-width: 300px;
        max-width: 90%;
        padding: 16px 20px;
        font-size: 15px;
        bottom: 20px;
      }

      .message mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }
    }
  `]
})
export class InfoMessageComponent implements OnInit, OnDestroy {
  visible = false;
  title = '';
  text = '';
  private subscription?: Subscription;
  private timeoutId?: ReturnType<typeof setTimeout>;

  constructor(
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Inscreve no stream e filtra apenas notificações tipo 'info'
    this.subscription = this.notificationService.notification$.subscribe(notification => {
      if (notification.type === 'info') {
        this.title = notification.title;
        this.text = notification.text;
        this.visible = true;
        this.cdr.detectChanges();
        
        // Limpa timeout anterior se existir
        if (this.timeoutId) {
          clearTimeout(this.timeoutId);
        }
        
        // Fecha automaticamente após duração configurada
        this.timeoutId = setTimeout(() => {
          this.visible = false;
          this.cdr.detectChanges();
        }, notification.durationMs);
      }
    });
  }

  // Fecha mensagem manualmente e cancela timeout
  close() {
    this.visible = false;
    this.cdr.detectChanges();
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }

  // Cleanup ao destruir componente
  ngOnDestroy() {
    this.subscription?.unsubscribe();
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }
}