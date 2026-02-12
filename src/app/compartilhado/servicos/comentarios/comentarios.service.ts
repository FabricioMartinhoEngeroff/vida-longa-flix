import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

type TipoComentario = 'video' | 'cardapio';

@Injectable({ providedIn: 'root' })
export class ComentariosService {
  private state = new BehaviorSubject<Record<string, string[]>>({});
  readonly comentarios$ = this.state.asObservable();

  private key(tipo: TipoComentario, id: string): string {
    return `${tipo}:${id}`;
  }

  get(tipo: TipoComentario, id: string): string[] {
    return this.state.value[this.key(tipo, id)] ?? [];
  }

  add(tipo: TipoComentario, id: string, texto: string): void {
    const txt = (texto ?? '').trim();
    if (!txt) return;

    const chave = this.key(tipo, id);
    const atual = this.state.value;
    const lista = [...(atual[chave] ?? []), `Você: ${txt}`];

    this.state.next({ ...atual, [chave]: lista });
  }
}
