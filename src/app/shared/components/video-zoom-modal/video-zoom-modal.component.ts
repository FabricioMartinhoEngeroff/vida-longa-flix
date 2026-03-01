import { ChangeDetectorRef, Component, DestroyRef, HostListener, OnDestroy, effect, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';
import { CommentsBoxComponent, CommentItem } from '../comments-box/comments-box.component';
import { Video } from '../../types/videos';
import { ModalService } from '../../services/modal/modal.service';
import { VideoService } from '../../services/video/video.service';
import { CommentResponse, CommentsService } from '../../services/comments/comments.service';
import { AuthService } from '../../../auth/services/auth.service';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';
import { EditableFieldComponent } from '../editable-field/editable-field.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';



@Component({
  selector: 'app-video-zoom-modal',
  standalone: true,
  imports: [MatIconModule, CommentsBoxComponent, ConfirmationModalComponent, EditableFieldComponent],
  templateUrl:'./video-zoom-modal.component.html',
  styleUrls: ['./video-zoom-modal.component.css'],
})
export class VideoZoomModalComponent implements OnDestroy {
  private readonly destroyRef = inject(DestroyRef);
  selectedVideo: Video | null = null;
   updatedVideo: Video | null = null; 
  comments: CommentResponse[] = [];

  isAdmin = false;
  isDeleteCommentModalOpen = false;
  private pendingCommentId: string | null = null;

  private hasHistoryEntry = false;
  private subscriptions = new Subscription();

  private readonly cdr = inject(ChangeDetectorRef);

  constructor(
    private modalService: ModalService,
    private videoService: VideoService,
    private commentsService: CommentsService,
    private authService: AuthService
  ) {
    effect(() => {
      const video = this.modalService.selectedVideo();
      this.handleSelectedVideo(video as Video | null);
      this.cdr.markForCheck();
    });

    effect(() => {
      const video = this.modalService.selectedVideo() as Video | null;
      this.commentsService.comments(); // depend on signal updates
      if (!video?.id) {
        this.comments = [];
        this.cdr.markForCheck();
        return;
      }
      this.comments = this.commentsService.get(video.id);
      this.cdr.markForCheck();
    });

    this.authService.user$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((u) => {
        this.isAdmin = !!u?.roles?.some((r) => r === 'ROLE_ADMIN');
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

  
  this.commentsService.loadByVideo(this.updatedVideo.id);
}


  @HostListener('window:popstate')
  onPopState(): void {
    if (!this.selectedVideo) return;
    this.hasHistoryEntry = false;
    this.closeModal();
  }

  addComment(text: string): void {
     if (!this.updatedVideo) return;

     this.commentsService.add(this.updatedVideo.id, text);
  }

  askDeleteComment(commentId: string): void {
    this.pendingCommentId = commentId;
    this.isDeleteCommentModalOpen = true;
  }

  cancelDeleteComment(): void {
    this.isDeleteCommentModalOpen = false;
    this.pendingCommentId = null;
  }

  confirmDeleteComment(): void {
    if (!this.updatedVideo || !this.pendingCommentId) return;
    this.commentsService.delete(this.pendingCommentId, this.updatedVideo.id);
    this.cancelDeleteComment();
  }

  get commentItems(): CommentItem[] {
    return (this.comments ?? []).map((c) => ({
      id: c.id,
      text: c.text,
      author: c.user?.name,
      date: c.date,
    }));
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

  onFieldSave(field: string, value: string | number): void { 
    if (!this.updatedVideo) return;                          
    this.videoService.updateVideo(
      this.updatedVideo.id,
      ({ [field]: value } as Partial<Video>)
    );
  }                                                          

  toggleFavorite(): void {
    if (!this.updatedVideo) return;

    this.videoService.toggleFavorite(this.updatedVideo.id);

    this.updatedVideo =
      this.videoService.videos().find((v) => v.id === this.updatedVideo?.id) ??
      this.updatedVideo;
  }
}
