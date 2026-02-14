import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndicadorSenhaComponent } from './indicador-senha.component';
import { ForcaSenha } from '../../utils/validador-senha-forte';

describe('IndicadorSenhaComponent', () => {
  let component: IndicadorSenhaComponent;
  let fixture: ComponentFixture<IndicadorSenhaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IndicadorSenhaComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(IndicadorSenhaComponent);
    component = fixture.componentInstance;
  });

  it('deve criar componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve calcular força da senha ao mudar input', () => {
    component.senha = 'SenhaForte1!';
    component.ngOnChanges();

    expect(component.resultado.forca).toBe(ForcaSenha.MUITO_FORTE);
  });

  it('deve esconder lista de requisitos quando mostrarRequisitos=false', () => {
    component.senha = 'abc';
    component.mostrarRequisitos = false;
    fixture.detectChanges();

    const lista = fixture.nativeElement.querySelector('.lista-requisitos');
    expect(lista).toBeNull();
  });
});
