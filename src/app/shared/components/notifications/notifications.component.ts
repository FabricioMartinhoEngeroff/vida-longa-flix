import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { ContentNotification, ContentNotificationsService } from '../../services/notifications/content-notifications.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css'],
})
export class NotificationsComponent {
  private readonly notifications = inject(ContentNotificationsService);
  private readonly router = inject(Router);

  isOpen = false;
  readonly activeTab = signal<'all' | 'unread' | 'read'>('all');
  private readonly pageSize = 10;
  readonly visibleCount = signal(this.pageSize);

  readonly unreadCount = this.notifications.unreadCount;

  readonly filtered = computed(() => {
    const list = this.notifications.notifications();
    const tab = this.activeTab();
    if (tab === 'unread') return list.filter((n) => !n.read);
    if (tab === 'read') return list.filter((n) => n.read);
    return list;
  });

  readonly visible = computed(() => this.filtered().slice(0, this.visibleCount()));
  readonly canLoadMore = computed(() => this.filtered().length > this.visibleCount());

  openNotifications(event?: MouseEvent): void {
    event?.stopPropagation();
    this.isOpen = true;
    this.visibleCount.set(this.pageSize);
  }

  close(): void {
    this.isOpen = false;
  }

  setTab(tab: 'all' | 'unread' | 'read'): void {
    this.activeTab.set(tab);
    this.visibleCount.set(this.pageSize);
  }

  markAllRead(): void {
    this.notifications.markAllRead();
  }

  loadMore(): void {
    this.visibleCount.update((c) => c + this.pageSize);
  }

  openItem(item: ContentNotification): void {
    this.notifications.markRead(item.id);

    const path = item.type === 'MENU' ? '/app/menus' : '/app';
    this.router.navigateByUrl(path);
    this.close();
  }

  label(item: ContentNotification): string {
    return item.type === 'MENU' ? 'Cardápio' : 'Vídeo';
  }

  formatDate(ms: number): string {
    try {
      return new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short',
      }).format(new Date(ms));
    } catch {
      return new Date(ms).toLocaleString();
    }
  }
}
