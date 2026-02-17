import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { VideoService } from '../../shared/services/video/video.service';
import { Video } from '../../shared/types/videos';


@Component({
  selector: 'app-video-admin',
  standalone: true,
  imports: [ReactiveFormsModule, MatIconModule],
  templateUrl: './video-admin.component.html',
  styleUrls: ['./video-admin.component.css'],
})
export class VideoAdminComponent {
  form: FormGroup;
  uploadIcon = 'cloud_upload';

  constructor(
    private fb: FormBuilder,
    private videoService: VideoService
  ) {
   
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(5)]],
      url: ['', [Validators.required]],
      cover: [''],
      categoryName: ['Sem categoria'],

      recipe: [''],
      proteins: [0],
      carbs: [0],
      fats: [0],
      fiber: [0],
      calories: [0],
    });
  }

  onVideoFile(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    this.form.patchValue({ url: previewUrl });
  }

 
  onCoverFile(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    this.form.patchValue({ cover: previewUrl });
  }

 
  save(): void {
    if (this.form.invalid) return;

    // Normaliza nome da categoria
    const raw = (this.form.value.categoryName || '').trim();
    const name = raw ? raw[0].toUpperCase() + raw.slice(1).toLowerCase() : 'Sem categoria';
    const id = name.toLowerCase().replace(/\s+/g, '-');

    const video: Video = {
      id: Date.now().toString(),
      title: this.form.value.title,
      description: this.form.value.description,
      url: this.form.value.url,
      cover: this.form.value.cover || this.form.value.url,

      category: { id, name },
      comments: [],
      views: 0,
      watchTime: 0,

      recipe: this.form.value.recipe || '',
      proteins: Number(this.form.value.proteins || 0),
      carbs: Number(this.form.value.carbs || 0),
      fats: Number(this.form.value.fats || 0),
      fiber: Number(this.form.value.fiber || 0),
      calories: Number(this.form.value.calories || 0),

      favorited: false,
    };

    this.videoService.addVideo(video);

    this.form.reset({
      categoryName: 'Sem categoria',
      proteins: 0,
      carbs: 0,
      fats: 0,
      fiber: 0,
      calories: 0,
    });
  }
}