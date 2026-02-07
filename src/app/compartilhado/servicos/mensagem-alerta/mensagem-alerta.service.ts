import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Notificacao {
  tipo: 'sucesso' | 'erro' | 'aviso' | 'info';
  titulo: string;
  texto: string;
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
  sucesso(texto: string, titulo: string = 'Sucesso') {
    this.notificacaoSubject.next({ tipo: 'sucesso', titulo, texto });
  }

  /**
   * Exibe mensagem de erro (vermelho)
   */
  erro(texto: string, titulo: string = 'Erro') {
    this.notificacaoSubject.next({ tipo: 'erro', titulo, texto });
  }

  /**
   * Exibe mensagem de aviso (amarelo)
   */
  aviso(texto: string, titulo: string = 'Atenção') {
    this.notificacaoSubject.next({ tipo: 'aviso', titulo, texto });
  }

  /**
   * Exibe mensagem de informação (azul)
   */
  info(texto: string, titulo: string = 'Informação') {
    this.notificacaoSubject.next({ tipo: 'info', titulo, texto });
  }

  /**
   * Exibe mensagem padronizada (usando constantes)
   */
  exibirPadrao(mensagem: { tipo: 'sucesso' | 'erro' | 'aviso' | 'info'; titulo: string; texto: string }) {
    this.notificacaoSubject.next(mensagem);
  }
}