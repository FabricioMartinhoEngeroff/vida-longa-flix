import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MensagemAjusteEmailComponent } from './mensagem-ajuste-email.component';

describe('MensagemAjusteEmailComponent', () => {
  let component: MensagemAjusteEmailComponent;
  let fixture: ComponentFixture<MensagemAjusteEmailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MensagemAjusteEmailComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MensagemAjusteEmailComponent);
    component = fixture.componentInstance;
  });

  it('deve criar componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve retornar configuração do tipo informado', () => {
    component.tipoErro = 'temporario';

    expect(component.configuracao.titulo).toBe('Email temporário detectado');
    expect(component.configuracao.icone).toBe('block');
  });

  it('deve renderizar sugestão quando emailSugerido existir', () => {
    component.tipoErro = 'sugestao';
    component.emailSugerido = 'user@gmail.com';
    fixture.detectChanges();

    const botao = fixture.nativeElement.querySelector('.btn-sugestao');
    expect(botao).toBeTruthy();
    expect(botao.textContent).toContain('user@gmail.com');
  });
});
