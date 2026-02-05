import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { InputPadraoComponent } from './input-padrao.component';

describe('InputPadraoComponent', () => {
  let component: InputPadraoComponent;
  let fixture: ComponentFixture<InputPadraoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputPadraoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InputPadraoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve renderizar placeholder', () => {
    component.placeholder = 'Digite aqui';
    fixture.detectChanges();

    const input = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
    expect(input.placeholder).toBe('Digite aqui');
  });

  it('deve emitir valueChange ao digitar', () => {
    const spy = spyOn(component.valueChange, 'emit');

    const input = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
    input.value = 'abc';
    input.dispatchEvent(new Event('input'));

    expect(spy).toHaveBeenCalledWith('abc');
  });

  it('deve aplicar type corretamente', () => {
    component.type = 'password';
    fixture.detectChanges();

    const input = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
    expect(input.type).toBe('password');
  });

  it('deve aplicar name corretamente', () => {
    component.name = 'email';
    fixture.detectChanges();

    const input = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
    expect(input.name).toBe('email');
  });
});
