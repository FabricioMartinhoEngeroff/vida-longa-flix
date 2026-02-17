import { Injectable, signal, computed } from '@angular/core';
import { ViewHistoryService } from '../view-history/view-history.service';

export interface Video {
  id: string;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root',
})
export class ModalService {
 
  private selectedVideoSignal = signal<Video | null>(null);

  readonly selectedVideo = this.selectedVideoSignal.asReadonly();

  readonly isModalOpen = computed(() => !!this.selectedVideoSignal());

  constructor(private viewHistory: ViewHistoryService) {}

  open(video: Video): void {
    const email = localStorage.getItem('userEmail') || 'guest@local';
    this.viewHistory.registerView(email, video.id);
    this.selectedVideoSignal.set(video);
  }

  close(): void {
    this.selectedVideoSignal.set(null);
  }
  
  isVideoOpen(videoId: string): boolean {
    return this.selectedVideoSignal()?.id === videoId;
  }
}