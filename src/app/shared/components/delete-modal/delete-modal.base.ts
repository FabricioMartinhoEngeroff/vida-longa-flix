import { Directive } from '@angular/core';
import { CategoriesService } from '../../services/categories/categories.service';
import { Category } from '../../types/videos';

@Directive()
export abstract class DeleteModalBase {
  isDeleteModalOpen = false;
  categories: Category[] = [];

  protected pendingDelete: {
    kind: string;
    id: string;
    label: string;
  } | null = null;

  protected abstract readonly itemDeleteTitle: string;  // ← itemDeleteTitle
  protected abstract readonly itemLabel: string;        // ← itemLabel

  constructor(protected categoriesService: CategoriesService) {}

  askDeleteCategory(id: string, name: string): void {
    this.pendingDelete = { kind: 'CATEGORY', id, label: name };
    this.isDeleteModalOpen = true;
  }

  cancelDelete(): void {
    this.isDeleteModalOpen = false;
    this.pendingDelete = null;
  }

  protected deleteCategory(): void {
    const pending = this.pendingDelete;
    if (!pending) return;

    this.categoriesService.delete(pending.id).subscribe({
      next: () => {
        this.categories = this.categories.filter((c) => c.id !== pending.id);
        this.cancelDelete();
      },
      error: () => this.cancelDelete(),
    });
  }

  get deleteTitle(): string {
    if (this.pendingDelete?.kind === 'CATEGORY') return 'Deletar categoria';
    return this.itemDeleteTitle;  // ← itemDeleteTitle
  }

  get deleteMessage(): string {
    const label = this.pendingDelete?.label ?? '';
    if (this.pendingDelete?.kind === 'CATEGORY') {
      return `Deseja mesmo deletar a categoria "${label}"?`;
    }
    return `Deseja mesmo deletar ${this.itemLabel} "${label}"?`;  // ← itemLabel
  }
}