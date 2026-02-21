import { NgFor } from '@angular/common';
import { Component, HostListener, OnInit, effect } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Params } from '@angular/router';

import { CategoryCarouselComponent } from '../../shared/components/category-carousel/category-carousel.component';
import { EngagementSummaryComponent } from '../../shared/components/engagement-summary/engagement-summary.component';
import { CommentsService } from '../../shared/services/comments/comments.service';
import { ModalService } from '../../shared/services/modal/modal.service';
import { VideoService } from '../../shared/services/video/video.service';
import { Video } from '../../shared/types/videos';
import { agruparPor as groupBy, Grupo as Group } from '../../shared/utils/agrupar-por';

type VideoGroup = Group<Video>;

@Component({
  selector: 'app-inicio', // pode trocar pra 'app-home' se quiser, mas ai ajuste onde usar
  standalone: true,
  imports: [NgFor, MatIconModule, CategoryCarouselComponent, EngagementSummaryComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  reelVideos: Video[] = [];
  videosByCategory: VideoGroup[] = [];
  isMobile = false;

  isPreviewVisible: Record<string, boolean> = {};

  private hoverTimeouts: Record<string, ReturnType<typeof setTimeout>> = {};
  private readonly HOVER_DELAY_MS = 2000;

  private searchType = '';
  private searchId = '';
  private searchCategory = '';
  private searchTerm = '';

  constructor(
    private videoService: VideoService,
    private modalService: ModalService,
    private commentsService: CommentsService,
    private route: ActivatedRoute
  ) {

    effect(() => {
      const videos = this.videoService.videos();
      this.reelVideos = videos;

      this.videosByCategory = groupBy(
        videos,
        (v) => v.category?.name || 'Sem categoria'
      );

      this.tryScrollToSearchTarget();
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params: Params) => {
      this.searchType = (params['tipo'] || '').toLowerCase();
      this.searchId = (params['id'] || '').toString();
      this.searchCategory = (params['cat'] || '').toString();
      this.searchTerm = (params['q'] || '').toString();
      this.tryScrollToSearchTarget();
    });

    this.updateIsMobile();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.updateIsMobile();
  }

  private updateIsMobile(): void {
    this.isMobile = window.innerWidth <= 768;
  }

  onVideoMouseEnter(videoId: string, event: Event): void {
    const wrapper = event.currentTarget as HTMLElement;
    const videoEl = wrapper.querySelector('video') as HTMLVideoElement;

    if (this.hoverTimeouts[videoId]) clearTimeout(this.hoverTimeouts[videoId]);

    this.hoverTimeouts[videoId] = setTimeout(() => {
      this.isPreviewVisible[videoId] = true;
      videoEl.currentTime = 0;
      videoEl.muted = true;
      videoEl.play().catch(() => {});
    }, this.HOVER_DELAY_MS);
  }

  onVideoMouseLeave(videoId: string, event: Event): void {
    const wrapper = event.currentTarget as HTMLElement;
    const videoEl = wrapper.querySelector('video') as HTMLVideoElement;

    if (this.hoverTimeouts[videoId]) {
      clearTimeout(this.hoverTimeouts[videoId]);
      delete this.hoverTimeouts[videoId];
    }

    this.isPreviewVisible[videoId] = false;
    videoEl.pause();
    videoEl.currentTime = 0;
  }

  openModal(video: Video): void {
    this.modalService.open(video);
  }

  toggleFavorite(videoId: string): void {
    this.videoService.toggleFavorite(videoId);
  }

  getTotalComments(videoId: string): number {
  return this.commentsService.get(videoId).length;
}

  viewAll(): void {
    // TODO: ver tudo
  }

  private tryScrollToSearchTarget(): void {
    if (!this.reelVideos.length) return;

    if (this.searchType === 'video' && this.searchId) {
      this.scrollToElement(`video-${this.searchId}`);
      return;
    }

    if (this.searchType === 'categoria-video' && this.searchCategory) {
      this.scrollToElement(this.buildCategoryId(this.searchCategory));
      return;
    }

    if (!this.searchTerm) return;

    const normalizedTerm = this.normalizeText(this.searchTerm);
    const target = [...this.reelVideos]
      .sort((a, b) =>
        a.title.localeCompare(b.title, 'pt-BR', { sensitivity: 'base' })
      )
      .find((v) =>
        this.normalizeText(v.title).includes(normalizedTerm) ||
        this.normalizeText(v.description).includes(normalizedTerm) ||
        this.normalizeText(v.category?.name || '').includes(normalizedTerm)
      );

    if (target) this.scrollToElement(`video-${target.id}`);
  }

  private scrollToElement(id: string): void {
    setTimeout(() => {
      document
        .getElementById(id)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 80);
  }

  private buildCategoryId(name: string): string {
    return 'cat-' + name.toLowerCase().trim().replace(/\s+/g, '-');
  }

  private normalizeText(text: string): string {
    return (text || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }
}
