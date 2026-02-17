import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';
import { FormFieldComponent } from './form-field.component';

describe('FormFieldComponent', () => {
  let component: FormFieldComponent;
  let fixture: ComponentFixture<FormFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormFieldComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FormFieldComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render placeholder', () => {
    component.placeholder = 'Enter email';
    fixture.detectChanges();

    const input = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
    expect(input.placeholder).toBe('Enter email');
  });

  it('should call onChange when typing', () => {
    fixture.detectChanges();
    const onChange = vi.fn();
    component.registerOnChange(onChange);

    const input = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
    input.value = 'test@email.com';
    input.dispatchEvent(new Event('input'));

    expect(onChange).toHaveBeenCalledWith('test@email.com');
  });

  it('should show error message when error exists', () => {
    component.error = 'Required field';
    fixture.detectChanges();

    const p = fixture.debugElement.query(By.css('.error'));
    expect(p).toBeTruthy();
    expect(p.nativeElement.textContent).toContain('Required field');
  });

  it('type=password should render eye button', () => {
    component.type = 'password';
    fixture.detectChanges();

    const btn = fixture.debugElement.query(By.css('.right-action'));
    expect(btn).toBeTruthy();
  });

  it('clicking eye button should toggle passwordVisible', () => {
    component.type = 'password';
    fixture.detectChanges();

    const btn = fixture.debugElement.query(By.css('.right-action')).nativeElement as HTMLButtonElement;

    expect(component.passwordVisible).toBe(false);
    btn.click();
    fixture.detectChanges();
    expect(component.passwordVisible).toBe(true);
  });
});