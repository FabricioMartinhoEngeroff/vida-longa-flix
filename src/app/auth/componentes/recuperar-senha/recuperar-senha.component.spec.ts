import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { RecuperarSenhaComponent } from './recuperar-senha.component';
import { NotificacaoService } from '../../../compartilhado/servicos/mensagem-alerta/mensagem-alerta.service';
import { EmailService } from '../../servicos/email/email.service';
import { MENSAGENS_PADRAO } from '../../../compartilhado/servicos/mensagem-alerta/mensagens-padrao.constants';

describe('RecuperarSenhaComponent', () => {
  let component: RecuperarSenhaComponent;
  let fixture: ComponentFixture<RecuperarSenhaComponent>;

  const notificacaoMock = {
    exibirPadrao: vi.fn(),
  };

  const emailServiceMock = {
    enviarRecuperacaoSenha: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    vi.useFakeTimers();
    notificacaoMock.exibirPadrao.mockReset();
    emailServiceMock.enviarRecuperacaoSenha.mockClear();

    await TestBed.configureTestingModule({
      imports: [RecuperarSenhaComponent],
      providers: [
        { provide: NotificacaoService, useValue: notificacaoMock },
        { provide: EmailService, useValue: emailServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RecuperarSenhaComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('deve criar componente', () => {
    expect(component).toBeTruthy();
  });

  it('não deve enviar quando formulário estiver inválido', async () => {
    await component.onEnviar();

    expect(emailServiceMock.enviarRecuperacaoSenha).not.toHaveBeenCalled();
  });

  it('deve enviar email, notificar e fechar modal', async () => {
    const fecharSpy = vi.spyOn(component.fechar, 'emit');
    component.form.setValue({ email: 'teste@email.com' });

    const promise = component.onEnviar();
    await promise;

    expect(emailServiceMock.enviarRecuperacaoSenha).toHaveBeenCalledWith('teste@email.com');
    expect(notificacaoMock.exibirPadrao).toHaveBeenCalledWith(MENSAGENS_PADRAO.EMAIL_RECUPERACAO_ENVIADO);

    vi.runAllTimers();
    expect(fecharSpy).toHaveBeenCalled();
  });
});
