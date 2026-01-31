import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Notificacao {
  tipo: 'sucesso' | 'erro' | 'aviso';
  texto: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificacaoService {
  private notificacaoSubject = new Subject<Notificacao>();
  notificacao$ = this.notificacaoSubject.asObservable();

  sucesso(texto: string) {
    this.notificacaoSubject.next({ tipo: 'sucesso', texto });
  }

  erro(texto: string) {
    this.notificacaoSubject.next({ tipo: 'erro', texto });
  }

  aviso(texto: string) {
    this.notificacaoSubject.next({ tipo: 'aviso', texto });
  }
}