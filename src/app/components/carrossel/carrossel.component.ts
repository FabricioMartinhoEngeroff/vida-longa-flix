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
  @ViewChild('carrossel', { static: true }) carrosselRef!: ElementRef<HTMLDivElement>;

  scroll(direcao: 'left' | 'right') {
    const scrollAmount = direcao === 'left' ? -300 : 300;

    this.carrosselRef.nativeElement.scrollBy({
      left: scrollAmount,
      behavior: 'smooth',
    });
  }
}