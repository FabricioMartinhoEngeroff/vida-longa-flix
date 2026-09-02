import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { NotificationToastComponent } from './shared/components/alert-message/notification-toast.component';
import { NotificationService } from './shared/services/alert-message/alert-message.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
   NotificationToastComponent
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent implements OnInit, OnDestroy {
  private subscription?: Subscription;

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.subscription = this.notificationService.notification$.subscribe();
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}