import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryCarouselComponent } from './category-carousel.component';

@Component({
  standalone: true,
  imports: [CategoryCarouselComponent],
  template: `
    <app-category-carousel
      [title]="title"
      [items]="items"
      [itemTemplate]="tpl"
    ></app-category-carousel>

    <ng-template #tpl let-item>
      <div class="rendered-item">{{ item }}</div>
    </ng-template>
  `,
})
class HostComponent {
  title = 'Frutas';
  items = ['Maçã', 'Banana', 'Uva'];
}

describe('CategoryCarouselComponent', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should render the title', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Frutas');
  });

  it('should render all items using the provided template', () => {
    const el = fixture.nativeElement as HTMLElement;
    const rendered = Array.from(el.querySelectorAll('.rendered-item')).map((x) =>
      x.textContent?.trim()
    );

    expect(rendered).toEqual(['Maçã', 'Banana', 'Uva']);
  });

  it('should update rendered items when items input changes', async () => {
    const host = fixture.componentInstance;
    host.items = ['Pêra'];
    fixture.detectChanges();
    await fixture.whenStable();

    const el = fixture.nativeElement as HTMLElement;
    const rendered = Array.from(el.querySelectorAll('.rendered-item')).map((x) =>
      x.textContent?.trim()
    );

    expect(rendered).toEqual(['Pêra']);
  });
});
