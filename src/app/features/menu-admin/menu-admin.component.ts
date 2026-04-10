import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MenuService } from '../../shared/services/menus/menus-service';
import { MenuRequest } from '../../shared/types/menu';
import { Category } from '../../shared/types/videos';
import { CategoriesService } from '../../shared/services/categories/categories.service';
import { ConfirmationModalComponent } from '../../shared/components/confirmation-modal/confirmation-modal.component';
import { CsvUploadComponent } from '../../shared/components/csv-upload/csv-upload.component';
import { NotificationService } from '../../shared/services/alert-message/alert-message.service';

@Component({
  selector: 'app-menu-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, ConfirmationModalComponent, CsvUploadComponent],
  templateUrl: './menu-admin.component.html',
  styleUrls: ['./menu-admin.component.css'],
})
export class MenuAdminComponent implements OnInit {
  form: FormGroup;
  uploadIcon = 'cloud_upload';

  // Categorias do tipo MENU carregadas do backend
  categories: Category[] = [];

  coverFileName = '';
  isDraggingCover = false;

  isDeleteModalOpen = false;
  private pendingDelete: { kind: 'MENU' | 'CATEGORY'; id: string; label: string } | null = null;

  constructor(
    private fb: FormBuilder,
    private menuService: MenuService,
    private categoriesService: CategoriesService,
    private alert: NotificationService
  ) {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(5)]],
      categoryName: ['', Validators.required],
      cover: [''],
      recipe: [''],
      nutritionistTips: [''],
      protein: [0],
      carbs: [0],
      fat: [0],
      fiber: [0],
      calories: [0],
    });
  }

  ngOnInit(): void {
    // Busca categorias do tipo MENU igual ao VideoAdminComponent faz para VIDEO
    this.categoriesService.list('MENU').subscribe(cats => this.categories = cats);
  }

  menusList() {
    return this.menuService.menus();
  }

  onCoverFile(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.coverFileName = file.name;
    const previewUrl = URL.createObjectURL(file);
    this.form.patchValue({ cover: previewUrl });
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDropCover(event: DragEvent): void {
    event.preventDefault();
    this.isDraggingCover = false;
    const file = event.dataTransfer?.files[0];
    if (!file) return;
    this.coverFileName = file.name;
    const previewUrl = URL.createObjectURL(file);
    this.form.patchValue({ cover: previewUrl });
  }

  async save(): Promise<void> {
    if (this.form.invalid) return;

    let categoryId: string;
    try {
      categoryId = await this.categoriesService.ensureCategoryId(
        'MENU',
        this.form.value.categoryName,
        this.categories
      );
    } catch (e: any) {
      this.alert.error(e?.message || 'Categoria não encontrada.');
      return;
    }

    const typedName = (this.form.value.categoryName ?? '').trim();
    if (typedName && !this.categories.some(c => c.id === categoryId)) {
      this.categories = [...this.categories, { id: categoryId, name: typedName, type: 'MENU' }];
    }

    // Validação: não permite persistir blob:, data:, ou localhost como cover final
    const coverValue = this.form.value.cover || '';
    const isInvalidCover = /^(blob:|data:)/.test(coverValue) || coverValue.includes('localhost');
    const finalCover = isInvalidCover ? '' : coverValue;

    const request: MenuRequest = {
      title: this.form.value.title,
      description: this.form.value.description,
      cover: finalCover,
      categoryId,
      recipe: this.form.value.recipe || '',
      nutritionistTips: this.form.value.nutritionistTips || '',
      protein: Number(this.form.value.protein || 0),
      carbs: Number(this.form.value.carbs || 0),
      fat: Number(this.form.value.fat || 0),
      fiber: Number(this.form.value.fiber || 0),
      calories: Number(this.form.value.calories || 0),
    };

    this.menuService.addMenu(request);

    this.form.reset({
      categoryName: '',
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      calories: 0,
    });
    this.coverFileName = '';
  }

  onEditCoverFile(menuId: string, event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    // Validação de tipo de arquivo
    if (!file.type.startsWith('image/')) {
      return;
    }

    // Validação de tamanho (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return;
    }

    // TODO: Implementar upload real quando backend suportar
    // Por enquanto, usa URL pública ou permanece vazio
    const publicUrl = ''; // Placeholder para upload real
    this.menuService.updateMenu(menuId, { cover: publicUrl });
  }

  askDeleteMenu(id: string, title: string): void {
    this.pendingDelete = { kind: 'MENU', id, label: title };
    this.isDeleteModalOpen = true;
  }

  askDeleteCategory(id: string, name: string): void {
    this.pendingDelete = { kind: 'CATEGORY', id, label: name };
    this.isDeleteModalOpen = true;
  }

  cancelDelete(): void {
    this.isDeleteModalOpen = false;
    this.pendingDelete = null;
  }

  confirmDelete(): void {
    const pending = this.pendingDelete;
    if (!pending) return;

    if (pending.kind === 'MENU') {
      this.menuService.removeMenu(pending.id);
      this.cancelDelete();
      return;
    }

    this.categoriesService.delete(pending.id).subscribe({
      next: () => {
        this.categories = this.categories.filter((c) => c.id !== pending.id);
        this.cancelDelete();
      },
      error: () => {
        this.cancelDelete();
      },
    });
  }

  get deleteTitle(): string {
    if (this.pendingDelete?.kind === 'CATEGORY') return 'Deletar categoria';
    return 'Deletar cardápio';
  }

  get deleteMessage(): string {
    const label = this.pendingDelete?.label ?? '';
    if (this.pendingDelete?.kind === 'CATEGORY') {
      return `Deseja mesmo deletar a categoria “${label}”?`;
    }
    return `Deseja mesmo deletar o cardápio “${label}”?`;
  }
}
