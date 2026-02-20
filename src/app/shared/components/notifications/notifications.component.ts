import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css'],
})
export class NotificationsComponent {
  unreadCount = 3;

  openNotifications(): void {
    // Logica principal: ao clicar, abre a area/modal de notificacoes.
    // TODO: abrir notificações
  }
}
