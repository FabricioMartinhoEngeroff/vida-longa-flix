import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';
import { FavoriteButtonComponent } from './favorite-button.component';

describe('FavoriteButtonComponent', () => {
  let component: FavoriteButtonComponent;
  let fixture: ComponentFixture<FavoriteButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FavoriteButtonComponent], 
    }).compileComponents();

    fixture = TestBed.createComponent(FavoriteButtonComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit click on button click', () => {
    fixture.detectChanges();
    const emitSpy = vi.spyOn(component.click, 'emit');

    const button = fixture.debugElement.query(By.css('button.button'));
    button.triggerEventHandler('click', null);

    expect(emitSpy).toHaveBeenCalled();
  });

  it('should not have favorited class when favorited=false', () => {
    component.favorited = false;
    fixture.detectChanges();

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button.button');
    expect(button.classList.contains('favorited')).toBe(false);
  });

  it('should have favorited class when favorited=true', () => {
    component.favorited = true;
    fixture.detectChanges();

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button.button');
    expect(button.classList.contains('favorited')).toBe(true);
  });

  it('should render border icon when favorited=false', () => {
    component.favorited = false;
    fixture.detectChanges();

    const icon = fixture.nativeElement.querySelector('mat-icon') as HTMLElement;
    expect(icon.textContent?.trim()).toBe('favorite_border');
  });

  it('should render filled icon when favorited=true', () => {
    component.favorited = true;
    fixture.detectChanges();

    const icon = fixture.nativeElement.querySelector('mat-icon') as HTMLElement;
    expect(icon.textContent?.trim()).toBe('favorite');
  });
});