import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { vi } from 'vitest';

import { FavoritesComponent } from './favorites.component';
import { FavoritesService } from '../../shared/services/favorites/favorites.service.';
import { ModalService } from '../../shared/services/modal/modal.service';
import { VideoService } from '../../shared/services/video/video.service';
import { MenuService } from '../../shared/services/menus/menus-service';
import { MenuCommentsService } from '../../shared/services/menus/menu-comments-service';

describe('FavoritesComponent', () => {
  let component: FavoritesComponent;
  let fixture: ComponentFixture<FavoritesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FavoritesComponent],
      providers: [
        { provide: Router, useValue: { navigate: vi.fn() } },
        {
          provide: FavoritesService,
          useValue: {
            load: vi.fn(),
            videoFavorites: () => [],
            menuFavorites: () => [],
          },
        },
        { provide: ModalService, useValue: { open: vi.fn() } },
        { provide: VideoService, useValue: { videos: () => [], toggleFavorite: vi.fn() } },
        { provide: MenuService, useValue: { menus: () => [], toggleFavorite: vi.fn() } },
        { provide: MenuCommentsService, useValue: { comments: () => ({}), add: vi.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FavoritesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
