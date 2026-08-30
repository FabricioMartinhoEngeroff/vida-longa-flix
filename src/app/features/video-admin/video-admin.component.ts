import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { VideoService } from '../../shared/services/video/video.service';
import {VideoRequest } from '../../shared/types/videos';
import { CategoriesService } from '../../shared/services/categories/categories.service';
import { ConfirmationModalComponent } from '../../shared/components/confirmation-modal/confirmation-modal.component';
import { CsvUploadComponent } from '../../shared/components/csv-upload/csv-upload.component';
import { NotificationService } from '../../shared/services/alert-message/alert-message.service';
import { DeleteModalBase } from '../../shared/components/delete-modal/delete-modal.base';

@Component({
  selector: 'app-video-admin',
  standalone: true,
  imports: [ReactiveFormsModule, MatIconModule, ConfirmationModalComponent, CsvUploadComponent],
  templateUrl: './video-admin.component.html',
  styleUrls: ['./video-admin.component.css'],
})
export class VideoAdminComponent extends DeleteModalBase {
  form: FormGroup;
  uploadIcon = 'cloud_upload';

  videoFileName = '';
  coverFileName = '';
  isDraggingVideo = false;
  isDraggingCover = false;

  private videoFile: File | null = null;
  private coverFile: File | null = null;
  private isEditingCover = false;

  protected readonly itemDeleteTitle = 'Deletar vídeo';
protected readonly itemLabel = 'o vídeo';

  constructor(
    private fb: FormBuilder,
    private videoService: VideoService,
    categoriesService: CategoriesService,
    private alert: NotificationService
  ) {
    super(categoriesService);

    this.categoriesService.list('VIDEO').subscribe({
      next: (cats) => (this.categories = cats),
      error: () => {},
    });

    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(5)]],
      url: ['', [Validators.required]],
      cover: [''],
      categoryName: ['', Validators.required],
      recipe: [''],
      protein: [0],
      carbs: [0],
      fat: [0],
      fiber: [0],
      calories: [0],
    });
  }

  videosList() {
    return this.videoService.videos();
  }

  onVideoFile(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.videoFile = file;
    this.videoFileName = file.name;
    this.form.patchValue({ url: file.name });
  }

  onCoverFile(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.coverFile = file;
    this.coverFileName = file.name;
    this.form.patchValue({ cover: file.name });
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDropVideo(event: DragEvent): void {
    event.preventDefault();
    this.isDraggingVideo = false;
    const file = event.dataTransfer?.files[0];
    if (!file) return;
    this.videoFile = file;
    this.videoFileName = file.name;
    this.form.patchValue({ url: file.name });
  }

  onDropCover(event: DragEvent): void {
    event.preventDefault();
    this.isDraggingCover = false;
    const file = event.dataTransfer?.files[0];
    if (!file) return;
    this.coverFile = file;
    this.coverFileName = file.name;
    this.form.patchValue({ cover: file.name });
  }

  private isPublicUrl(value: string): boolean {
    if (!value) return true;
    return /^https?:\/\//.test(value) && !/localhost/i.test(value);
  }

  async save(): Promise<void> {
    if (this.form.invalid) return;

    const url = this.form.value.url;
    const cover = this.form.value.cover;
    const hasLocalVideo = !!this.videoFile;
    const hasLocalCover = !!this.coverFile;

    if (!hasLocalVideo && !this.isPublicUrl(url)) {
      this.alert.error('A URL do vídeo deve ser uma URL pública (https://).');
      return;
    }

    if (!hasLocalCover && cover && !this.isPublicUrl(cover)) {
      this.alert.error('A URL da capa deve ser uma URL pública (https://).');
      return;
    }

    let categoryId: string;
    try {
      categoryId = await this.categoriesService.ensureCategoryId(
        'VIDEO',
        this.form.value.categoryName.trim(),
        this.categories
      );
    } catch (e: any) {
      this.alert.error(e?.message || 'Categoria não encontrada.');
      return;
    }

    const typedName = (this.form.value.categoryName ?? '').trim();
    if (typedName && !this.categories.some(c => c.id === categoryId)) {
      this.categories = [...this.categories, { id: categoryId, name: typedName, type: 'VIDEO' }];
    }

    const request: VideoRequest = {
      title: this.form.value.title,
      description: this.form.value.description,
      url,
      cover: cover || url,
      categoryId,
      recipe: this.form.value.recipe || '',
      protein: Number(this.form.value.protein || 0),
      carbs: Number(this.form.value.carbs || 0),
      fat: Number(this.form.value.fat || 0),
      fiber: Number(this.form.value.fiber || 0),
      calories: Number(this.form.value.calories || 0),
    };

    if (this.videoFile) {
      this.videoService.addVideoWithFiles(request, this.videoFile, this.coverFile ?? undefined);
    } else {
      this.videoService.addVideo(request);
    }

    this.form.reset({ categoryName: '', protein: 0, carbs: 0, fat: 0, fiber: 0, calories: 0 });
    this.videoFileName = '';
    this.coverFileName = '';
    this.videoFile = null;
    this.coverFile = null;
  }

  onEditCover(videoId: string, event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    if (file.size > 10 * 1024 * 1024) {
      this.alert.error('A imagem da capa deve ter no máximo 10MB.');
      return;
    }
    if (this.isEditingCover) return;
    this.isEditingCover = true;
    this.videoService.updateCover(videoId, file);
    setTimeout(() => { this.isEditingCover = false; }, 1000);
  }

  askDeleteVideo(id: string, title: string): void {
    this.pendingDelete = { kind: 'VIDEO', id, label: title };
    this.isDeleteModalOpen = true;
  }

  confirmDelete(): void {
    const pending = this.pendingDelete;
    if (!pending) return;

    if (pending.kind === 'VIDEO') {
      this.videoService.removeVideo(pending.id);
      this.cancelDelete();
      return;
    }

    this.deleteCategory();
  }
}