import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class MenuCommentsService {

  private state = signal<Record<string, string[]>>({});

  readonly comments = this.state.asReadonly();

  get(id: string): string[] {
    return this.state()[id] ?? [];
  }

  add(id: string, text: string): void {
    const txt = (text ?? '').trim();
    if (!txt) return;
    this.state.update(current => ({
      ...current,
      [id]: [...(current[id] ?? []), `Você: ${txt}`]
    }));
  }

  delete(menuId: string, commentText: string): void {
    this.state.update(current => ({
      ...current,
      [menuId]: (current[menuId] ?? []).filter(c => c !== commentText)
    }));
  }

  readonly totalComments = computed(() =>
    Object.values(this.state()).reduce((total, list) => total + list.length, 0)
  );
}