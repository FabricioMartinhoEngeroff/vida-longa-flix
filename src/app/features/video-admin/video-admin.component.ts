import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { VideoService } from '../../shared/services/video/video.service';
import { Category, VideoRequest } from '../../shared/types/videos';
import { CategoriesService } from '../../shared/services/categories/categories.service';
import { ConfirmationModalComponent } from '../../shared/components/confirmation-modal/confirmation-modal.component';
import { NotificationService } from '../../shared/services/alert-message/alert-message.service';


@Component({
  selector: 'app-video-admin',
  standalone: true,
  imports: [ReactiveFormsModule, MatIconModule, ConfirmationModalComponent],
  templateUrl: './video-admin.component.html',
  styleUrls: ['./video-admin.component.css'],
})
export class VideoAdminComponent {
  form: FormGroup;
  uploadIcon = 'cloud_upload';

  categories: Category[] = [];

  videoFileName = '';
  coverFileName = '';
  isDraggingVideo = false;
  isDraggingCover = false;

  isDeleteModalOpen = false;
  private pendingDelete: { kind: 'VIDEO' | 'CATEGORY'; id: string; label: string } | null = null;

  constructor(
    private fb: FormBuilder,
    private videoService: VideoService,
    private categoriesService: CategoriesService,
    private alert: NotificationService
  ) {
    this.categoriesService.list('VIDEO').subscribe((cats) => (this.categories = cats));

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
    this.videoFileName = file.name;
    const previewUrl = URL.createObjectURL(file);
    this.form.patchValue({ url: previewUrl });
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

  onDropVideo(event: DragEvent): void {
    event.preventDefault();
    this.isDraggingVideo = false;
    const file = event.dataTransfer?.files[0];
    if (!file) return;
    this.videoFileName = file.name;
    const previewUrl = URL.createObjectURL(file);
    this.form.patchValue({ url: previewUrl });
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
      'VIDEO',
      this.form.value.categoryName,
      this.categories
    );
  } catch (e: any) {
    this.alert.error(e?.message || 'Categoria não encontrada.');
    return;
  }

  // Keep local suggestions fresh
  const typedName = (this.form.value.categoryName ?? '').trim();
  if (typedName && !this.categories.some(c => c.id === categoryId)) {
    this.categories = [...this.categories, { id: categoryId, name: typedName, type: 'VIDEO' }];
  }

  const request: VideoRequest = {
    title: this.form.value.title,
    description: this.form.value.description,
    url: this.form.value.url,
    cover: this.form.value.cover || this.form.value.url,
    categoryId,
    recipe: this.form.value.recipe || '',
    protein: Number(this.form.value.protein || 0),
    carbs: Number(this.form.value.carbs || 0),
    fat: Number(this.form.value.fat || 0),
    fiber: Number(this.form.value.fiber || 0),
    calories: Number(this.form.value.calories || 0),
  };

  this.videoService.addVideo(request);

  this.form.reset({
    categoryName: '',
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    calories: 0,
  });
  this.videoFileName = '';
  this.coverFileName = '';
}

  askDeleteVideo(id: string, title: string): void {
    this.pendingDelete = { kind: 'VIDEO', id, label: title };
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

    if (pending.kind === 'VIDEO') {
      this.videoService.removeVideo(pending.id);
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
    return 'Deletar vídeo';
  }

  get deleteMessage(): string {
    const label = this.pendingDelete?.label ?? '';
    if (this.pendingDelete?.kind === 'CATEGORY') {
      return `Deseja mesmo deletar a categoria “${label}”?`;
    }
    return `Deseja mesmo deletar o vídeo “${label}”?`;
  }
}
