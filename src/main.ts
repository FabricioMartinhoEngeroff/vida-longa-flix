import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig).catch(() => {
  // Intentionally no console output here.
  // If you want production error reporting, integrate a remote logger (Sentry, etc).
});
