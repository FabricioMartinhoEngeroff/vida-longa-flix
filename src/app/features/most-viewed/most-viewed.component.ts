import { Component, OnInit, effect } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ModalService } from '../../shared/services/modal/modal.service';
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

  constructor(
    private videoService: VideoService,
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
    this.sortedVideos = [...this.videoService.videos()]
      .filter(v => v.views > 0)
      .sort((a, b) => b.views - a.views);
  }

  openModal(video: Video): void {
    this.modalService.open(video as any);
  }
}