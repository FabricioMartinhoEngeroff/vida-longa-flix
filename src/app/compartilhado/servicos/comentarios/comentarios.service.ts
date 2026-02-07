import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ComentariosService {
  private state = new BehaviorSubject<Record<string, string[]>>({});
  readonly comentarios$ = this.state.asObservable();

  get(id: string): string[] {
    return this.state.value[id] ?? [];
  }

  add(id: string, texto: string): void {
    const txt = (texto ?? '').trim();
    if (!txt) return;

    const atual = this.state.value;
    const lista = [...(atual[id] ?? []), `Você: ${txt}`];

    this.state.next({ ...atual, [id]: lista });
  }
}
