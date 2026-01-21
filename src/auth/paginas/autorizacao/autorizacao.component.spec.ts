import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AutorizacaoComponent } from './autorizacao.component';

describe('AutorizacaoComponent', () => {
  let component: AutorizacaoComponent;
  let fixture: ComponentFixture<AutorizacaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutorizacaoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AutorizacaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve iniciar com isRegistering false', () => {
    expect(component.isRegistering).toBeFalse();
  });

  it('deve alternar o modo', () => {
    component.alternarModo();
    expect(component.isRegistering).toBeTrue();

    component.alternarModo();
    expect(component.isRegistering).toBeFalse();
  });
});
