import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MenuService } from '../../shared/services/menus/menus-service';
import { Menu } from '../../shared/types/menu';


@Component({
  selector: 'app-menu-admin',
  standalone: true,
  imports: [ReactiveFormsModule, MatIconModule],
  templateUrl: './menu-admin.component.html',
  styleUrls: ['./menu-admin.component.css'],
})
export class MenuAdminComponent {
  form: FormGroup;
  uploadIcon = 'cloud_upload';

  constructor(
    private fb: FormBuilder,
    private menuService: MenuService
  ) {
   
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(5)]],
      categoryName: ['Sem categoria'],

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

  onCoverFile(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    this.form.patchValue({ cover: previewUrl });
  }

  save(): void {
    if (this.form.invalid) return;

    const raw = (this.form.value.categoryName || '').trim();
    const name = raw ? raw[0].toUpperCase() + raw.slice(1).toLowerCase() : 'Sem categoria';
    const id = name.toLowerCase().replace(/\s+/g, '-');

    const menu: Menu = {
      id: Date.now().toString(),
      title: this.form.value.title,
      description: this.form.value.description,
      cover: this.form.value.cover || '',

      category: { id, name, type: 'MENU' },

      recipe: this.form.value.recipe || '',
      nutritionistTips: this.form.value.nutritionistTips || '',
      protein: Number(this.form.value.protein || 0),
      carbs: Number(this.form.value.carbs || 0),
      fat: Number(this.form.value.fat || 0),
      fiber: Number(this.form.value.fiber || 0),
      calories: Number(this.form.value.calories || 0),
    };

    this.menuService.add(menu);

    this.form.reset({
      categoryName: 'Sem categoria',
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      calories: 0,
    });
  }
}