import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-logo',
  standalone: true,
  templateUrl: './logo.component.html',
  styleUrls: ['./logo.component.css'],
})
export class LogoComponent {
 
  @Input() src = 'assets/images/logo.png';
  @Input() alt = 'Logo';
  @Input() width = 180;
}