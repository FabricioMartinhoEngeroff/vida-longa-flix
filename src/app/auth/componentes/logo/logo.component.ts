import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-logo',
  standalone: true,
  templateUrl: './logo.component.html',
  styleUrls: ['./logo.component.css'],
})
export class LogoComponent {
  /** caminho da imagem (default) */
  @Input() src: string = 'assets/images/logo.png';

  /** texto alternativo */
  @Input() alt: string = 'Logo';

  /** largura em px (default igual ao React) */
  @Input() width: number = 180;
}
