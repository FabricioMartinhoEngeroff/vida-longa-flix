import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { vi } from 'vitest';
import { MenuService } from './menus-service';
import { FavoritesService } from '../favorites/favorites.service.';
import { LoggerService } from '../../../auth/services/logger.service';
import { environment } from '../../../../environments/environment';
import { Menu, MenuRequest } from '../../types/menu';
import { ContentNotificationsService } from '../notifications/content-notifications.service';

const baseUrl = `${environment.apiUrl}/menus`;
const adminUrl = `${environment.apiUrl}/admin/menus`;

class FavoritesServiceMock {
  toggle = vi.fn();
  isFavorited = vi.fn().mockReturnValue(false);
}

class LoggerServiceMock {
  error = vi.fn();
}

class NotificationsMock {
  add = vi.fn();
}

const mockMenus: Menu[] = [
  {
    id: '1', title: 'Frango Grelhado', description: 'Rico em proteína',
    cover: 'cover1.jpg',
    category: { id: '1', name: 'Almoço', type: 'MENU' }, // <- type
    recipe: 'Grelhe por 20 min', nutritionistTips: 'Prefira azeite',
    protein: 40, carbs: 10, fat: 5, fiber: 2,
    calories: 250, likesCount: 0, favorited: false,
  },
  {
    id: '2', title: 'Vitamina de Banana', description: 'Café energético',
    cover: 'cover2.jpg',
    category: { id: '2', name: 'Café da Manhã', type: 'MENU' }, // <- type
    recipe: 'Bata no liquidificador', nutritionistTips: 'Adicione mel',
    protein: 8, carbs: 45, fat: 3, fiber: 5,
    calories: 220, likesCount: 2, favorited: false,
  },
];

describe('MenuService', () => {
  let service: MenuService;
  let httpMock: HttpTestingController;
  let favoritesMock: FavoritesServiceMock;
  let notificationsMock: NotificationsMock;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        MenuService,
        { provide: FavoritesService, useClass: FavoritesServiceMock },
        { provide: LoggerService, useClass: LoggerServiceMock },
        { provide: ContentNotificationsService, useClass: NotificationsMock },
      ],
    });

    service = TestBed.inject(MenuService);
    httpMock = TestBed.inject(HttpTestingController);
    favoritesMock = TestBed.inject(FavoritesService) as any;
    notificationsMock = TestBed.inject(ContentNotificationsService) as any;

    // Consome o GET inicial que o construtor dispara
    httpMock.expectOne(baseUrl).flush(mockMenus);
  });

  afterEach(() => httpMock.verify());

  it('should create service', () => {
    expect(service).toBeTruthy();
  });

  it('should load menus from backend', () => {
    expect(service.menus().length).toBe(2);
    expect(service.totalMenus()).toBe(2);
  });

  it('should set empty array when backend fails', () => {
    service.loadMenus();
    httpMock.expectOne(baseUrl).error(new ProgressEvent('error'));
    expect(service.menus().length).toBe(0);
  });

  it('should create menu and reload list', () => {
    const request: MenuRequest = {
      title: 'Novo Menu', description: 'Descrição',
      cover: 'cover.jpg', categoryId: '1',
      recipe: 'Receita', nutritionistTips: 'Dica',
      protein: 20, carbs: 30, fat: 5, fiber: 3, calories: 200,
    };

    service.addMenu(request);

    // POST vai para rota admin
    const postReq = httpMock.expectOne(adminUrl);
    expect(postReq.request.method).toBe('POST');
    postReq.flush(null);

    // Reload busca da rota pública
    httpMock.expectOne(baseUrl).flush([
      ...mockMenus,
      { ...mockMenus[0], id: '3', title: 'Novo Menu' }
    ]);

    expect(notificationsMock.add).toHaveBeenCalledWith('MENU', 'Novo Menu');
    expect(service.totalMenus()).toBe(3);
  });

  it('should update menu and reload list', () => {
    service.updateMenu('1', { title: 'Frango Editado' });

    const putReq = httpMock.expectOne(`${adminUrl}/1`);
    expect(putReq.request.method).toBe('PUT');
    expect(putReq.request.body).toEqual({ title: 'Frango Editado' });
    putReq.flush(null);

    httpMock.expectOne(baseUrl).flush([
      { ...mockMenus[0], title: 'Frango Editado' },
      mockMenus[1],
    ]);

    expect(service.getMenuById('1')?.title).toBe('Frango Editado');
  });

  it('should update menu cover with multipart upload and reload list', () => {
    const file = new File(['cover'], 'nova-capa.jpg', { type: 'image/jpeg' });

    service.updateCover('1', file);

    const putReq = httpMock.expectOne(`${adminUrl}/1`);
    expect(putReq.request.method).toBe('PUT');
    expect(putReq.request.body instanceof FormData).toBe(true);
    expect((putReq.request.body as FormData).get('cover')).toBeTruthy();
    putReq.flush(null);

    httpMock.expectOne(baseUrl).flush([
      { ...mockMenus[0], cover: 'https://cdn/nova-capa.jpg' },
      mockMenus[1],
    ]);

    expect(service.getMenuById('1')?.cover).toBe('https://cdn/nova-capa.jpg');
  });

  it('should delete menu and reload list', () => {
    service.removeMenu('1');

    // DELETE vai para rota admin
    const deleteReq = httpMock.expectOne(`${adminUrl}/1`);
    expect(deleteReq.request.method).toBe('DELETE');
    deleteReq.flush(null);

    // Reload busca da rota pública
    httpMock.expectOne(baseUrl).flush([mockMenus[1]]);
    expect(service.totalMenus()).toBe(1);
  });

  it('should toggle favorite — call FavoritesService and update local state', () => {
    service.toggleFavorite('1');

    expect(favoritesMock.toggle).toHaveBeenCalledWith('1', 'MENU');

    const updated = service.menus().find(m => m.id === '1')!;
    expect(updated.favorited).toBe(true);
    expect(updated.likesCount).toBe(1);
  });

  it('should decrement likesCount when unfavoriting', () => {
    service.toggleFavorite('1');
    service.toggleFavorite('1');

    const updated = service.menus().find(m => m.id === '1')!;
    expect(updated.favorited).toBe(false);
    expect(updated.likesCount).toBe(0);
    expect(favoritesMock.toggle).toHaveBeenCalledTimes(2);
  });

  it('should get menu by id', () => {
    expect(service.getMenuById('1')?.title).toBe('Frango Grelhado');
  });

  it('should return undefined for unknown id', () => {
    expect(service.getMenuById('999')).toBeUndefined();
  });

  it('should filter menus by category', () => {
    const filtered = service.getMenusByCategory('1');
    expect(filtered.length).toBe(1);
    expect(filtered[0].category.name).toBe('Almoço');
  });

  it('should update totalLikes reactively', () => {
    const initial = service.totalLikes();
    service.toggleFavorite('1');
    expect(service.totalLikes()).toBe(initial + 1);
  });
});
