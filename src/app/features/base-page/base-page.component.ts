import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { HeaderComponent } from '../../shared/components/header/header.component';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { VideoZoomModalComponent } from '../../shared/components/video-zoom-modal/video-zoom-modal.component';


@Component({
  selector: 'app-base-page',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    NavbarComponent,
    FooterComponent,
    VideoZoomModalComponent
  ],
  templateUrl: './base-page.component.html',
  styleUrls: ['./base-page.component.css'],
})
export class BasePageComponent {}