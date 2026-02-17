import { Component, HostListener, OnDestroy, effect } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';
import { CommentsBoxComponent } from '../comments-box/comments-box.component';
import { Video } from '../../types/videos';
import { ModalService } from '../../services/modal/modal.service';
import { VideoService } from '../../services/video/video.service';
import { CommentsService } from '../../services/comments/comments.service';



@Component({
  selector: 'app-video-zoom-modal',
  standalone: true,
  imports: [MatIconModule, CommentsBoxComponent],
  templateUrl:'./video-zoom-modal.component.html',
  styleUrls: ['./video-zoom-modal.component.css'],
})
export class VideoZoomModalComponent implements OnDestroy {
  selectedVideo: Video | null = null;
   updatedVideo: Video | null = null; 
  comments: string[] = [];

  private hasHistoryEntry = false;
  private subscriptions = new Subscription();

  constructor(
    private modalService: ModalService,
    private videoService: VideoService,
    private commentsService: CommentsService
  ) {
    effect(() => {
      const video = this.modalService.selectedVideo();
      this.handleSelectedVideo(video as Video | null);
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private handleSelectedVideo(video: Video | null): void {
    this.selectedVideo = video;

    if (!this.selectedVideo) {
      this.updatedVideo = null;
      this.comments = [];
      this.hasHistoryEntry = false;
      return;
    }

    if (!this.hasHistoryEntry && typeof window !== 'undefined') {
      window.history.pushState({ modal: 'video' }, '');
      this.hasHistoryEntry = true;
    }

   this.updatedVideo =
      this.videoService.videos().find((v) => v.id === this.selectedVideo?.id) ??
      this.selectedVideo;

    this.comments = this.commentsService.get('video', this.updatedVideo.id);
  }

  @HostListener('window:popstate')
  onPopState(): void {
    if (!this.selectedVideo) return;
    this.hasHistoryEntry = false;
    this.closeModal();
  }

  addComment(text: string): void {
     if (!this.updatedVideo) return;

    this.commentsService.add('video', this.updatedVideo.id, text);
    this.comments = this.commentsService.get('video', this.updatedVideo.id);
  }

  closeModal(): void {
    if (!this.selectedVideo) return;

    const hadHistoryEntry = this.hasHistoryEntry;
    this.hasHistoryEntry = false;

    this.modalService.close();

    if (hadHistoryEntry && typeof window !== 'undefined') {
      window.history.back();
    }
  }

  preventClose(event: MouseEvent): void {
    event.stopPropagation();
  }

  toggleFavorite(): void {
    if (!this.updatedVideo) return;

    this.videoService.toggleFavorite(this.updatedVideo.id);

    this.updatedVideo =
      this.videoService.videos().find((v) => v.id === this.updatedVideo?.id) ??
      this.updatedVideo;
  }
}
