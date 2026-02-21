import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { VideoService } from '../../shared/services/video/video.service';
import { Category, Video, VideoRequest } from '../../shared/types/videos';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';


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

 categories: Category[] = [];

constructor(
  private fb: FormBuilder,
  private videoService: VideoService,
  private http: HttpClient
) {
  this.http.get<Category[]>(`${environment.apiUrl}/categories`, { params: { type: 'VIDEO' } })
    .subscribe(cats => this.categories = cats);

  this.form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required, Validators.minLength(5)]],
    url: ['', [Validators.required]],
    cover: [''],
    categoryId: ['', Validators.required],
    recipe: [''],
    protein: [0],
    carbs: [0],
    fat: [0],
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

  const request: VideoRequest = {
    title: this.form.value.title,
    description: this.form.value.description,
    url: this.form.value.url,
    cover: this.form.value.cover || this.form.value.url,
    categoryId: this.form.value.categoryId,    // ← direto do select, UUID real
    recipe: this.form.value.recipe || '',
    protein: Number(this.form.value.protein || 0),
    carbs: Number(this.form.value.carbs || 0),
    fat: Number(this.form.value.fat || 0),
    fiber: Number(this.form.value.fiber || 0),
    calories: Number(this.form.value.calories || 0),
  };

  this.videoService.addVideo(request);

  this.form.reset({
    categoryId: '',        
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    calories: 0,
  });
}
}