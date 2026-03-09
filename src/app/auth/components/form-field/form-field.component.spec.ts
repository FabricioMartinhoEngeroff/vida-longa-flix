import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';
import { FormFieldComponent } from './form-field.component';

describe('FormFieldComponent — Login & Register Scenarios', () => {
  let component: FormFieldComponent;
  let fixture: ComponentFixture<FormFieldComponent>;

  function cd(): void {
    fixture.componentRef.changeDetectorRef.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormFieldComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FormFieldComponent);
    component = fixture.componentInstance;
  });

  // ─── B39. FormFieldComponent — comportamentos gerais ─────────

  describe('B39. Comportamentos gerais', () => {
    it('#201 dynamicPlaceholder sem valor — retorna label', () => {
      component.label = 'E-mail';
      component.placeholder = 'seu@email.com';
      component.value = '';
      expect(component.dynamicPlaceholder).toBe('E-mail');
    });

    it('#202 dynamicPlaceholder com valor — retorna placeholder', () => {
      component.label = 'E-mail';
      component.placeholder = 'seu@email.com';
      component.value = 'test';
      expect(component.dynamicPlaceholder).toBe('seu@email.com');
    });

    it('#203 onInput com mask — aplica mascara e emite valor clean', () => {
      component.mask = 'phone';
      cd();

      const onChange = vi.fn();
      component.registerOnChange(onChange);

      const input = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
      input.value = '11987654321';
      input.dispatchEvent(new Event('input'));

      expect(input.value).toBe('(11) 98765-4321');
      expect(onChange).toHaveBeenCalledWith('11987654321');
    });

    it('#204 onInput sem mask — emite valor bruto', () => {
      cd();
      const onChange = vi.fn();
      component.registerOnChange(onChange);

      const input = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
      input.value = 'test@email.com';
      input.dispatchEvent(new Event('input'));

      expect(onChange).toHaveBeenCalledWith('test@email.com');
    });

    it('#205 maxlength excedido — trunca valor', () => {
      component.maxlength = 5;
      cd();

      const onChange = vi.fn();
      component.registerOnChange(onChange);

      const input = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
      input.value = '1234567890';
      input.dispatchEvent(new Event('input'));

      expect(onChange).toHaveBeenCalledWith('12345');
    });

    it('#206 blur — executa onTouched', () => {
      cd();
      const onTouched = vi.fn();
      component.registerOnTouched(onTouched);

      const input = fixture.debugElement.query(By.css('input')).nativeElement;
      input.dispatchEvent(new Event('blur'));

      expect(onTouched).toHaveBeenCalled();
    });

    it('#207 counter text com showCounter=true e maxlength', () => {
      component.showCounter = true;
      component.maxlength = 100;
      component.value = 'hello';
      expect(component.counterText).toBe('5/100');
    });

    it('#208 counterClass at-limit com 100%', () => {
      component.maxlength = 10;
      component.value = '1234567890';
      expect(component.counterClass).toBe('at-limit');
    });

    it('#209 counterClass near-limit com 90-99%', () => {
      component.maxlength = 10;
      component.value = '123456789'; // 90%
      expect(component.counterClass).toBe('near-limit');
    });

    it('#210 setDisabledState(true) — disabled=true', () => {
      component.setDisabledState(true);
      expect(component.disabled).toBe(true);

      component.setDisabledState(false);
      expect(component.disabled).toBe(false);
    });

    it('#211 writeValue(null) — value=""', () => {
      component.writeValue(null as any);
      expect(component.value).toBe('');
    });

    it('error message exibida quando error existe', () => {
      component.error = 'Required field';
      cd();

      const p = fixture.debugElement.query(By.css('.error'));
      expect(p).toBeTruthy();
      expect(p.nativeElement.textContent).toContain('Required field');
    });

    it('type=password — toggle visibilidade funciona', () => {
      component.type = 'password';
      cd();

      expect(component.passwordVisible).toBe(false);
      expect(component.inputType).toBe('password');
      expect(component.rightIcon).toBe('eye');

      component.togglePassword();
      expect(component.passwordVisible).toBe(true);
      expect(component.inputType).toBe('text');
      expect(component.rightIcon).toBe('eyeOff');
    });
  });
});
