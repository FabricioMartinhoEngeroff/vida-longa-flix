import { TestBed } from '@angular/core/testing';

import {
  DURACAO_NOTIFICACAO_ALERTA_ERRO_MS,
  DURACAO_NOTIFICACAO_INFO_MS,
  DURACAO_NOTIFICACAO_SUCESSO_MS,
  Notificacao,
  NotificacaoService,
  obterDuracaoPadraoNotificacao,
} from './mensagem-alerta.service';
import { MENSAGENS_PADRAO } from './mensagens-padrao.constants';

describe('NotificacaoService', () => {
  let service: NotificacaoService;
  let notificacoes: Notificacao[];

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificacaoService);
    notificacoes = [];
    service.notificacao$.subscribe((n) => notificacoes.push(n));
  });

  it('deve retornar duração padrão por tipo', () => {
    expect(obterDuracaoPadraoNotificacao('sucesso')).toBe(DURACAO_NOTIFICACAO_SUCESSO_MS);
    expect(obterDuracaoPadraoNotificacao('info')).toBe(DURACAO_NOTIFICACAO_INFO_MS);
    expect(obterDuracaoPadraoNotificacao('erro')).toBe(DURACAO_NOTIFICACAO_ALERTA_ERRO_MS);
    expect(obterDuracaoPadraoNotificacao('aviso')).toBe(DURACAO_NOTIFICACAO_ALERTA_ERRO_MS);
  });

  it('deve emitir notificação de sucesso com duração padrão', () => {
    service.sucesso('ok');

    const ultima = notificacoes.at(-1)!;
    expect(ultima.tipo).toBe('sucesso');
    expect(ultima.texto).toBe('ok');
    expect(ultima.duracaoMs).toBe(DURACAO_NOTIFICACAO_SUCESSO_MS);
  });

  it('deve emitir notificação de erro e aviso', () => {
    service.erro('falhou');
    service.aviso('atenção');

    expect(notificacoes[0].tipo).toBe('erro');
    expect(notificacoes[1].tipo).toBe('aviso');
  });

  it('deve respeitar duracaoMs da mensagem padrão quando informado', () => {
    service.exibirPadrao({ ...MENSAGENS_PADRAO.LOGIN_SUCESSO, duracaoMs: 9999 });

    const ultima = notificacoes.at(-1)!;
    expect(ultima.duracaoMs).toBe(9999);
  });
});
