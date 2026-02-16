import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';


import { Video } from '../../shared/types/videos';
import { ModalService } from '../../shared/services/modal/modal';
import { HistoricoViewsService } from '../../shared/services/historico-views/historico-views';
import { VideoService } from '../../shared/services/video/video';

@Component({
  selector: 'app-mais-vistos',
  standalone: true,
  imports: [NgIf, NgFor, MatIconModule],
  templateUrl: './mais-vistos.component.html',
  styleUrls: ['./mais-vistos.component.css'],
})
export class MaisVistosComponent implements OnInit {
  videosOrdenados: Video[] = [];
  email = localStorage.getItem('userEmail') || 'guest@local';

  constructor(
    private videoService: VideoService,
    private historicoViews: HistoricoViewsService,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    const views = this.historicoViews.getViews(this.email);

    this.videosOrdenados = [...this.videoService.videosReels]
      .map((v) => ({
        ...v,
        viewsCount: views[v.id] || 0,
      }))
      .filter((v) => v.viewsCount > 0)
      .sort((a: any, b: any) => b.viewsCount - a.viewsCount);
  }

  abrirModal(video: Video): void {
    this.modalService.abrir(video);
  }
}
