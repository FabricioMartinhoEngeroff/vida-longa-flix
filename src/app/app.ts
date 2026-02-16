import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { SuccessMessageComponent } from './shared/components/alert-message/success-message.component';
import { ErrorMessageComponent } from './shared/components/alert-message/error-message.component';
import { WarningMessageComponent } from './shared/components/alert-message/warning-message.component';
import { InfoMessageComponent } from './shared/components/alert-message/info-message.component';
import { NotificationService } from './shared/services/alert-message/alert-message.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    SuccessMessageComponent,
    ErrorMessageComponent,
    WarningMessageComponent,
    InfoMessageComponent
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