import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { FavoritesComponent } from './favorites.component';
import { HomeComponent } from '../home/home.component';
import { MenusComponent } from '../menus/menus.component';

import { ModalService } from '../../shared/services/modal/modal.service';
import { LoggerService } from '../../auth/services/logger.service';
import { Video } from '../../shared/types/videos';
import { Menu } from '../../shared/types/menu';

describe('Favorites flows (integration)', () => {
  let httpMock: HttpTestingController;
  const loggerMock = { error: vi.fn() };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, HomeComponent, MenusComponent, FavoritesComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { queryParams: of({}), snapshot: { queryParams: {} } } },
        { provide: LoggerService, useValue: loggerMock },
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    TestBed.resetTestingModule();
    vi.clearAllMocks();
  });

  it('menu like on Menus → shows in Favorites by category and opens menu modal', async () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true });

    const menusFixture = TestBed.createComponent(MenusComponent);

    // Initial loads (service constructors)
    const mockMenu: Menu = {
      id: 'menu-1',
      title: 'Menu Teste',
      description: 'Descrição do menu',
      cover: 'cover.jpg',
      category: { id: 'cat-1', name: 'Almoço', type: 'MENU' } as any,
      recipe: 'Receita teste',
      nutritionistTips: 'Dica',
      protein: 10,
      carbs: 20,
      fat: 5,
      fiber: 2,
      calories: 200,
      favorited: false,
      likesCount: 0,
    };

    httpMock.expectOne('http://localhost:8090/api/menus').flush([mockMenu]);
    menusFixture.detectChanges(false);
    await menusFixture.whenStable();

    // Click like in MenusComponent card (EngagementSummary)
    const likeBtn: HTMLButtonElement | null = menusFixture.nativeElement.querySelector(
      'button[aria-label="Curtir"]'
    );
    expect(likeBtn).toBeTruthy();
    likeBtn!.click();

    const toggleReq = httpMock.expectOne('http://localhost:8090/api/favorites/MENU/menu-1');
    expect(toggleReq.request.method).toBe('POST');
    toggleReq.flush({ favorited: true, itemId: 'menu-1', itemType: 'MENU' });

    menusFixture.detectChanges(false);
    await menusFixture.whenStable();

    // Open Favorites AFTER liking (simulates real navigation / refresh)
    const favoritesFixture = TestBed.createComponent(FavoritesComponent);
    httpMock.expectOne('http://localhost:8090/api/videos').flush([]);

    favoritesFixture.detectChanges(false);
    httpMock.expectOne('http://localhost:8090/api/favorites').flush([
      { itemId: 'menu-1', itemType: 'MENU', createdAt: new Date().toISOString() },
    ]);
    favoritesFixture.detectChanges(false);
    await favoritesFixture.whenStable();

    expect(favoritesFixture.componentInstance.favoriteMenus.map((m) => m.id)).toContain('menu-1');

    // Favorites now has the menu card rendered
    const menuCard: HTMLElement | null = favoritesFixture.nativeElement.querySelector('#menu-menu-1');
    expect(menuCard).toBeTruthy();
    expect(favoritesFixture.nativeElement.textContent).toContain('Almoço');

    // Open modal from Favorites
    menuCard!.click();
    favoritesFixture.detectChanges(false);
    await favoritesFixture.whenStable();

    const modalBackdrop = favoritesFixture.nativeElement.querySelector('.modal-backdrop');
    expect(modalBackdrop).toBeTruthy();
    expect(favoritesFixture.nativeElement.textContent).toContain('Receita');
  });

  it('video like on Home → shows in Favorites and clicking card opens video modal', async () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true });

    const modalService = TestBed.inject(ModalService);
    const openSpy = vi.spyOn(modalService, 'open');

    const homeFixture = TestBed.createComponent(HomeComponent);

    const mockVideo: Video = {
      id: 'video-1',
      title: 'Video Teste',
      description: 'Descrição do vídeo',
      url: 'http://test/video.mp4',
      cover: 'http://test/cover.jpg',
      category: { id: 'cat-v', name: 'Treino' },
      comments: [],
      commentCount: 0,
      views: 0,
      watchTime: 0,
      recipe: '',
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      calories: 0,
      favorited: false,
      likesCount: 0,
    };

    httpMock.expectOne('http://localhost:8090/api/videos').flush([mockVideo]);
    homeFixture.detectChanges(false);
    await homeFixture.whenStable();

    // Click like in Home (EngagementSummary)
    const likeBtn: HTMLButtonElement | null = homeFixture.nativeElement.querySelector(
      'button[aria-label="Curtir"]'
    );
    expect(likeBtn).toBeTruthy();
    likeBtn!.click();

    const toggleReq = httpMock.expectOne('http://localhost:8090/api/favorites/VIDEO/video-1');
    expect(toggleReq.request.method).toBe('POST');
    toggleReq.flush({ favorited: true, itemId: 'video-1', itemType: 'VIDEO' });

    homeFixture.detectChanges(false);
    await homeFixture.whenStable();

    const favoritesFixture = TestBed.createComponent(FavoritesComponent);
    httpMock.expectOne('http://localhost:8090/api/menus').flush([]);

    favoritesFixture.detectChanges(false);
    httpMock.expectOne('http://localhost:8090/api/favorites').flush([
      { itemId: 'video-1', itemType: 'VIDEO', createdAt: new Date().toISOString() },
    ]);
    favoritesFixture.detectChanges(false);
    await favoritesFixture.whenStable();

    expect(favoritesFixture.componentInstance.favoriteVideos.map((v) => v.id)).toContain('video-1');

    const videoCard: HTMLElement | null = favoritesFixture.nativeElement.querySelector('#video-video-1');
    expect(videoCard).toBeTruthy();
    expect(favoritesFixture.nativeElement.textContent).toContain('Treino');

    const videoOpenTarget: HTMLElement | null = videoCard!.querySelector('.video-wrapper');
    expect(videoOpenTarget).toBeTruthy();
    videoOpenTarget!.click();
    expect(openSpy).toHaveBeenCalled();
    expect(openSpy.mock.calls[0][0].id).toBe('video-1');

    const viewReq = httpMock.expectOne('http://localhost:8090/api/videos/video-1/view');
    expect(viewReq.request.method).toBe('PATCH');
    viewReq.flush({});
  });
});
