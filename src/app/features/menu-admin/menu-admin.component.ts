import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MenuService } from '../../shared/services/menus/menus-service';
import { MenuRequest } from '../../shared/types/menu';
import { CategoriesService } from '../../shared/services/categories/categories.service';
import { ConfirmationModalComponent } from '../../shared/components/confirmation-modal/confirmation-modal.component';
import { CsvUploadComponent } from '../../shared/components/csv-upload/csv-upload.component';
import { NotificationService } from '../../shared/services/alert-message/alert-message.service';
import { DeleteModalBase } from '../../shared/components/delete-modal/delete-modal.base';

@Component({
  selector: 'app-menu-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, ConfirmationModalComponent, CsvUploadComponent],
  templateUrl: './menu-admin.component.html',
  styleUrls: ['./menu-admin.component.css'],
})
export class MenuAdminComponent extends DeleteModalBase implements OnInit {
  form: FormGroup;
  uploadIcon = 'cloud_upload';

  coverFileName = '';
  isDraggingCover = false;

  private isSaving = false;
  private editingCoverMenuIds = new Set<string>();

  protected readonly itemDeleteTitle = 'Deletar cardápio';
  protected readonly itemLabel = 'o cardápio';

  constructor(
    private fb: FormBuilder,
    private menuService: MenuService,
    categoriesService: CategoriesService,
    private alert: NotificationService
  ) {
    super(categoriesService);

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
    this.categoriesService.list('MENU').subscribe({
      next: (cats) => this.categories = cats,
      error: () => { this.categories = []; },
    });
  }

  menusList() {
    return this.menuService.menus();
  }

  onCoverFile(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.coverFileName = file.name;
    this.form.patchValue({ cover: URL.createObjectURL(file) });
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
    this.form.patchValue({ cover: URL.createObjectURL(file) });
  }

  async save(): Promise<void> {
    if (this.form.invalid) return;
    if (this.isSaving) return;
    this.isSaving = true;

    try {
      const categoryId = await this.categoriesService.ensureCategoryId(
        'MENU',
        this.form.value.categoryName,
        this.categories
      );

      const typedName = (this.form.value.categoryName ?? '').trim();
      if (typedName && !this.categories.some(c => c.id === categoryId)) {
        this.categories = [...this.categories, { id: categoryId, name: typedName, type: 'MENU' }];
      }

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

      this.form.reset({ categoryName: '', protein: 0, carbs: 0, fat: 0, fiber: 0, calories: 0 });
      this.coverFileName = '';
    } catch (e: any) {
      this.alert.error(e?.message || 'Categoria não encontrada.');
    } finally {
      this.isSaving = false;
    }
  }

  onEditCoverFile(menuId: string, event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    if (file.size > 10 * 1024 * 1024) {
      this.alert.error('A imagem da capa deve ter no máximo 10MB.');
      return;
    }
    if (this.editingCoverMenuIds.has(menuId)) return;
    this.editingCoverMenuIds.add(menuId);
    this.menuService.updateCover(menuId, file);
    setTimeout(() => { this.editingCoverMenuIds.delete(menuId); }, 1000);
  }

  askDeleteMenu(id: string, title: string): void {
    this.pendingDelete = { kind: 'MENU', id, label: title };
    this.isDeleteModalOpen = true;
  }

  confirmDelete(): void {
    const pending = this.pendingDelete;
    if (!pending) return;

    if (pending.kind === 'MENU') {
      this.menuService.removeMenu(pending.id);
      this.cancelDelete();
      return;
    }

    this.deleteCategory();
  }
}