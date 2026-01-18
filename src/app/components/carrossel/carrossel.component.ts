import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-carrossel',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './carrossel.component.html',
  styleUrls: ['./carrossel.component.css'],
})
export class CarrosselComponent {
  @ViewChild('carrossel', { static: true })
  carrosselRef!: ElementRef<HTMLDivElement>;

  scroll(direcao: 'left' | 'right') {
    const el = this.carrosselRef.nativeElement;

    // scroll proporcional ao tamanho do carrossel
    const scrollAmount = Math.round(el.clientWidth * 0.8) * (direcao === 'left' ? -1 : 1);

    el.scrollBy({
      left: scrollAmount,
      behavior: 'smooth',
    });
  }
}
