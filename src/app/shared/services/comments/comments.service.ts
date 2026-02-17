import { Injectable, signal, computed } from '@angular/core';

type CommentType = 'video' | 'menu';

@Injectable({ providedIn: 'root' })
export class CommentsService {

  private state = signal<Record<string, string[]>>({});

  readonly comments = this.state.asReadonly();

  private key(type: CommentType, id: string): string {
    return `${type}:${id}`;
  }

  get(type: CommentType, id: string): string[] {
    return this.state()[this.key(type, id)] ?? [];
  }

  
  add(type: CommentType, id: string, text: string): void {
    const txt = (text ?? '').trim();
    if (!txt) return;

    const key = this.key(type, id);

    this.state.update(current => ({
      ...current,
      [key]: [...(current[key] ?? []), `Você: ${txt}`]
    }));
  }

  clear(type: CommentType, id: string): void {
    const key = this.key(type, id);
    
    this.state.update(current => {
      const { [key]: removed, ...rest } = current;
      return rest;
    });
  }

  readonly totalComments = computed(() => {
    return Object.values(this.state()).reduce(
      (total, comments) => total + comments.length,
      0
    );
  });
}