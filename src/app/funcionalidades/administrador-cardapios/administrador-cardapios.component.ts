import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CardapioService } from '../../shared/services/menus/menus-service';
import { Cardapio } from '../../shared/types/menu';



@Component({
  selector: 'app-admin-cardapios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './administrador-cardapios.component.html',
  styleUrls: ['./administrador-cardapios.component.css'],
})
export class AdministradorCardapiosComponent {
  form: FormGroup;
  uploadIcon = 'cloud_upload';

  constructor(private fb: FormBuilder, private cardapioService: CardapioService) {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(5)]],
      categoryName: ['Sem categoria'],

      capa: [''],

      receita: [''],
      dicasNutri: [''],
      proteinas: [0],
      carboidratos: [0],
      gorduras: [0],
      fibras: [0],
      calorias: [0],
    });
  }

  onCapaFile(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    this.form.patchValue({ capa: previewUrl });
  }

  salvar(): void {
    if (this.form.invalid) return;

    const raw = (this.form.value.categoryName || '').trim();
const nome = raw ? raw[0].toUpperCase() + raw.slice(1).toLowerCase() : 'Sem categoria';
const id = nome.toLowerCase().replace(/\s+/g, '-');


    const cardapio: Cardapio = {
      id: Date.now().toString(),
      title: this.form.value.title,
      description: this.form.value.description,
      capa: this.form.value.capa || '',

      category: { id, name: nome },

      receita: this.form.value.receita || '',
      dicasNutri: this.form.value.dicasNutri || '',
      proteinas: Number(this.form.value.proteinas || 0),
      carboidratos: Number(this.form.value.carboidratos || 0),
      gorduras: Number(this.form.value.gorduras || 0),
      fibras: Number(this.form.value.fibras || 0),
      calorias: Number(this.form.value.calorias || 0),
    };

    this.cardapioService.add(cardapio);

    this.form.reset({
      categoryName: 'Sem categoria',
      proteinas: 0,
      carboidratos: 0,
      gorduras: 0,
      fibras: 0,
      calorias: 0,
    });
  }
}
