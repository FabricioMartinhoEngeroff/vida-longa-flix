import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.css'],
})
export class CarouselComponent {
  @ViewChild('carousel', { static: true })
  carouselRef!: ElementRef<HTMLDivElement>;

  scroll(direction: 'left' | 'right') {
    const el = this.carouselRef.nativeElement;

    const scrollAmount = Math.round(el.clientWidth * 0.8) * (direction === 'left' ? -1 : 1);

    el.scrollBy({
      left: scrollAmount,
      behavior: 'smooth',
    });
  }
}
