import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';
import { StandardInputComponent } from './standard-input.component';

describe('StandardInputComponent', () => {
  let component: StandardInputComponent;
  let fixture: ComponentFixture<StandardInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StandardInputComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StandardInputComponent);
    component = fixture.componentInstance;
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should render placeholder', () => {
    component.placeholder = 'Type here';
    fixture.detectChanges();

    const input = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
    expect(input.placeholder).toBe('Type here');
  });

  it('should emit valueChange when typing', () => {
    fixture.detectChanges();
    const spy = vi.spyOn(component.valueChange, 'emit');

    const input = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
    input.value = 'abc';
    input.dispatchEvent(new Event('input'));

    expect(spy).toHaveBeenCalledWith('abc');
  });

  it('should apply type correctly', () => {
    component.type = 'password';
    fixture.detectChanges();

    const input = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
    expect(input.type).toBe('password');
  });

  it('should apply name correctly', () => {
    component.name = 'email';
    fixture.detectChanges();

    const input = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
    expect(input.name).toBe('email');
  });
});