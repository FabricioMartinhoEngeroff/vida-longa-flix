import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { ModalMudarSenhaComponent } from './modal-mudar-senha.component';
import { NotificacaoService } from '../../servicos/mensagem-alerta/mensagem-alerta.service';

describe('ModalMudarSenhaComponent', () => {
  let component: ModalMudarSenhaComponent;
  let fixture: ComponentFixture<ModalMudarSenhaComponent>;

  const notificacaoMock = {
    aviso: vi.fn(),
    exibirPadrao: vi.fn(),
  };

  beforeEach(async () => {
    notificacaoMock.aviso.mockReset();
    notificacaoMock.exibirPadrao.mockReset();

    await TestBed.configureTestingModule({
      imports: [ModalMudarSenhaComponent],
      providers: [{ provide: NotificacaoService, useValue: notificacaoMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalMudarSenhaComponent);
    component = fixture.componentInstance;
  });

  it('deve criar componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve validar campos obrigatórios', () => {
    component.onConfirmar();

    expect(component.erro).toBe('Preencha todos os campos');
  });

  it('deve validar confirmação de senha', () => {
    component.senhaAtual = 'Atual123!';
    component.novaSenha = 'NovaSenha1!';
    component.confirmacaoSenha = 'OutraSenha1!';

    component.onConfirmar();

    expect(component.erro).toBe('As senhas digitadas não são iguais');
  });

  it('deve emitir confirmação quando senha nova for válida', () => {
    const confirmarSpy = vi.spyOn(component.confirmar, 'emit');

    component.senhaAtual = 'Atual123!';
    component.novaSenha = 'SenhaForte1!';
    component.confirmacaoSenha = 'SenhaForte1!';

    component.onConfirmar();

    expect(confirmarSpy).toHaveBeenCalledWith({ senhaAtual: 'Atual123!', novaSenha: 'SenhaForte1!' });
    expect(component.novaSenha).toBe('');
    expect(component.confirmacaoSenha).toBe('');
  });
});
