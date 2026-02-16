import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-notificacoes',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './notificacoes.component.html',
  styleUrls: ['./notificacoes.component.css']
})
export class NotificacoesComponent {
  quantidadeNaoLidas = 3; // Exemplo: 3 notificações não lidas

  abrirNotificacoes() {
    console.log('🔔 Abrir notificações');
    // TODO: Implementar modal de notificações
  }
}