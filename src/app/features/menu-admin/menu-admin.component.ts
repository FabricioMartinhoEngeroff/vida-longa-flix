import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MenuService } from '../../shared/services/menus/menus-service';
import { MenuRequest } from '../../shared/types/menu';
import { Category } from '../../shared/types/videos';
import { CategoriesService } from '../../shared/services/categories/categories.service';

@Component({
  selector: 'app-menu-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './menu-admin.component.html',
  styleUrls: ['./menu-admin.component.css'],
})
export class MenuAdminComponent implements OnInit {
  form: FormGroup;
  uploadIcon = 'cloud_upload';

  // Categorias do tipo MENU carregadas do backend
  categories: Category[] = [];

  constructor(
    private fb: FormBuilder,
    private menuService: MenuService,
    private categoriesService: CategoriesService
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

  onCoverFile(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
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
    } catch {
      return;
    }

    const typedName = (this.form.value.categoryName ?? '').trim();
    if (typedName && !this.categories.some(c => c.id === categoryId)) {
      this.categories = [...this.categories, { id: categoryId, name: typedName, type: 'MENU' }];
    }

    const request: MenuRequest = {
      title: this.form.value.title,
      description: this.form.value.description,
      cover: this.form.value.cover || '',
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
  }
}
