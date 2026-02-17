import { Component, OnInit, effect } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ModalService } from '../../shared/services/modal/modal.service';
import { ViewHistoryService } from '../../shared/services/view-history/view-history.service';
import { VideoService } from '../../shared/services/video/video.service';
import { Video } from '../../shared/types/videos';

@Component({
  selector: 'app-most-viewed',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './most-viewed.component.html',
  styleUrls: ['./most-viewed.component.css'],
})
export class MostViewedComponent implements OnInit {
  sortedVideos: Video[] = [];
  email = localStorage.getItem('userEmail') || 'guest@local';

  constructor(
    private videoService: VideoService,
    private viewHistory: ViewHistoryService,
    private modalService: ModalService
  ) {
   
    effect(() => {
      this.updateSortedVideos();
    });
  }

  ngOnInit(): void {
    this.updateSortedVideos();
  }

  private updateSortedVideos(): void {
    const views = this.viewHistory.getViews(this.email);

    this.sortedVideos = [...this.videoService.videos()]
      .map((v) => ({
        ...v,
        viewsCount: views[v.id] || 0,
      }))
      .filter((v) => v.viewsCount && v.viewsCount > 0)
      .sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0));
  }

  openModal(video: Video): void {
    this.modalService.open(video as any);
  }
}