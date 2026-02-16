import { Component, Input, TemplateRef } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

import { CarouselComponent } from '../carousel/carousel.component';
import { TitleComponent } from '../title/title.component';

@Component({
  selector: 'app-category-carousel',
  standalone: true,
  imports: [NgTemplateOutlet, CarouselComponent, TitleComponent],
  templateUrl: './category-carousel.component.html',
  styleUrls: ['./category-carousel.component.css'],
})
export class CategoryCarouselComponent<T = unknown> {
  
  @Input() title = '';
  @Input() items: T[] = [];
  @Input({ required: true }) itemTemplate!: TemplateRef<{ $implicit: T }>;
}
