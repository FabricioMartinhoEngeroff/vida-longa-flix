import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CarrosselComponent } from './carrossel.component';

describe('CarrosselComponent', () => {
  let component: CarrosselComponent;
  let fixture: ComponentFixture<CarrosselComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarrosselComponent], // ✅ standalone
    }).compileComponents();

    fixture = TestBed.createComponent(CarrosselComponent);
    component = fixture.componentInstance;

    fixture.detectChanges(); // ✅ renderiza template
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should scroll right when clicking right button', () => {
    const carrosselEl = component.carrosselRef.nativeElement;

    // espiona o scrollBy do elemento
    spyOn(carrosselEl, 'scrollBy');

    const btnRight = fixture.debugElement.query(By.css('.scroll-button.right'));
    btnRight.triggerEventHandler('click', null);

    expect(carrosselEl.scrollBy).toHaveBeenCalled();
  });

  it('should scroll left when clicking left button', () => {
    const carrosselEl = component.carrosselRef.nativeElement;

    spyOn(carrosselEl, 'scrollBy');

    const btnLeft = fixture.debugElement.query(By.css('.scroll-button.left'));
    btnLeft.triggerEventHandler('click', null);

    expect(carrosselEl.scrollBy).toHaveBeenCalled();
  });
});
