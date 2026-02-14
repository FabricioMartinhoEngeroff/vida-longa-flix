import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface NotificacaoPayload {
  tipo: 'sucesso' | 'erro' | 'aviso' | 'info';
  titulo: string;
  texto: string;
  duracaoMs?: number;
}

export interface Notificacao extends Omit<NotificacaoPayload, 'duracaoMs'> {
  duracaoMs: number;
}

export const DURACAO_NOTIFICACAO_SUCESSO_MS = 2000;
export const DURACAO_NOTIFICACAO_ALERTA_ERRO_MS = 4000;
export const DURACAO_NOTIFICACAO_INFO_MS = 4000;

export function obterDuracaoPadraoNotificacao(tipo: NotificacaoPayload['tipo']): number {
  if (tipo === 'sucesso') return DURACAO_NOTIFICACAO_SUCESSO_MS;
  if (tipo === 'info') return DURACAO_NOTIFICACAO_INFO_MS;
  return DURACAO_NOTIFICACAO_ALERTA_ERRO_MS;
}

@Injectable({
  providedIn: 'root'
})
export class NotificacaoService {
  private notificacaoSubject = new Subject<Notificacao>();
  notificacao$ = this.notificacaoSubject.asObservable();

  /**
   * Exibe mensagem de sucesso (verde)
   */
  sucesso(
    texto: string,
    titulo: string = 'Sucesso',
    duracaoMs: number = DURACAO_NOTIFICACAO_SUCESSO_MS
  ) {
    this.notificacaoSubject.next({ tipo: 'sucesso', titulo, texto, duracaoMs });
  }

  /**
   * Exibe mensagem de erro (vermelho)
   */
  erro(
    texto: string,
    titulo: string = 'Erro',
    duracaoMs: number = DURACAO_NOTIFICACAO_ALERTA_ERRO_MS
  ) {
    this.notificacaoSubject.next({ tipo: 'erro', titulo, texto, duracaoMs });
  }

  /**
   * Exibe mensagem de aviso (amarelo)
   */
  aviso(
    texto: string,
    titulo: string = 'Atenção',
    duracaoMs: number = DURACAO_NOTIFICACAO_ALERTA_ERRO_MS
  ) {
    this.notificacaoSubject.next({ tipo: 'aviso', titulo, texto, duracaoMs });
  }

  /**
   * Exibe mensagem de informação (azul)
   */
  info(
    texto: string,
    titulo: string = 'Informação',
    duracaoMs: number = DURACAO_NOTIFICACAO_INFO_MS
  ) {
    this.notificacaoSubject.next({ tipo: 'info', titulo, texto, duracaoMs });
  }

  /**
   * Exibe mensagem padronizada (usando constantes)
   */
  exibirPadrao(
    mensagem: NotificacaoPayload,
    duracaoMs: number = obterDuracaoPadraoNotificacao(mensagem.tipo)
  ) {
    this.notificacaoSubject.next({
      ...mensagem,
      duracaoMs: mensagem.duracaoMs ?? duracaoMs
    });
  }
}
