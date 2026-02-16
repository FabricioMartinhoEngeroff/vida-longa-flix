import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';

import { CarouselComponent } from './carousel.component';

describe('CarouselComponent', () => {
  let component: CarouselComponent;
  let fixture: ComponentFixture<CarouselComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarouselComponent], // ✅ standalone
    }).compileComponents();

    fixture = TestBed.createComponent(CarouselComponent);
    component = fixture.componentInstance;

    fixture.detectChanges(); // ✅ renderiza template
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should scroll right when clicking right button', () => {
    const carouselEl = component.carouselRef.nativeElement;
    const scrollByMock = vi.fn();
    Object.defineProperty(carouselEl, 'scrollBy', {
      value: scrollByMock,
      writable: true,
      configurable: true,
    });

    const btnRight = fixture.debugElement.query(By.css('.scroll-button.right'));
    btnRight.triggerEventHandler('click', null);

    expect(scrollByMock).toHaveBeenCalled();
  });

  it('should scroll left when clicking left button', () => {
    const carouselEl = component.carouselRef.nativeElement;
    const scrollByMock = vi.fn();
    Object.defineProperty(carouselEl, 'scrollBy', {
      value: scrollByMock,
      writable: true,
      configurable: true,
    });

    const btnLeft = fixture.debugElement.query(By.css('.scroll-button.left'));
    btnLeft.triggerEventHandler('click', null);

    expect(scrollByMock).toHaveBeenCalled();
  });
});
