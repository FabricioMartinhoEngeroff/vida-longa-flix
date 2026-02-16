import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { VideoService } from '../../shared/services/video/video';
import { Video } from '../../shared/types/videos';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-admin-videos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './administrador-videos.component.html',
  styleUrls: ['./administrador-videos.component.css'],
})
export class AdminVideosComponent {
  form: FormGroup;
  uploadIcon = 'cloud_upload';

  constructor(private fb: FormBuilder, private videoService: VideoService) {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(5)]],
      url: ['', [Validators.required]],
      capa: [''],
      categoryName: ['Sem categoria'],

      receita: [''],
      proteinas: [0],
      carboidratos: [0],
      gorduras: [0],
      fibras: [0],
      calorias: [0],
    });
  }

  onVideoFile(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  const previewUrl = URL.createObjectURL(file);
  this.form.patchValue({ url: previewUrl });
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


    const v: Video = {
      id: Date.now().toString(),
      title: this.form.value.title,
      description: this.form.value.description,
      url: this.form.value.url,
      capa: this.form.value.capa || this.form.value.url,

      category: { id, name: nome },
      comments: [],
      views: 0,
      watchTime: 0,

      receita: this.form.value.receita || '',
      proteinas: Number(this.form.value.proteinas || 0),
      carboidratos: Number(this.form.value.carboidratos || 0),
      gorduras: Number(this.form.value.gorduras || 0),
      fibras: Number(this.form.value.fibras || 0),
      calorias: Number(this.form.value.calorias || 0),

      favorita: false,
    };

    // por enquanto apenas adiciona em memória
    this.videoService.addVideo(v);

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
