import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { vi } from 'vitest';
import { VideoAdminComponent } from './video-admin.component';
import { VideoService } from '../../shared/services/video/video.service';
import { environment } from '../../../environments/environment';
import { signal } from '@angular/core';

describe('VideoAdminComponent', () => {
  let component: VideoAdminComponent;
  let fixture: ComponentFixture<VideoAdminComponent>;
  let httpMock: HttpTestingController;
  let addVideoSpy: ReturnType<typeof vi.fn>;
  let removeVideoSpy: ReturnType<typeof vi.fn>;

  const mockCategories = [
    { id: 'cat-uuid-1', name: 'Bolos', type: 'VIDEO' },
    { id: 'cat-uuid-2', name: 'Salgados', type: 'VIDEO' },
  ];

  beforeEach(async () => {
    addVideoSpy = vi.fn();
    removeVideoSpy = vi.fn();

    const videosSignal = signal<any[]>([
      { id: 'v1', title: 'Video 1', category: { id: 'cat-uuid-1', name: 'Bolos' } },
    ]);

    await TestBed.configureTestingModule({
      imports: [VideoAdminComponent, HttpClientTestingModule],
      providers: [
        {
          provide: VideoService,
          useValue: { addVideo: addVideoSpy, removeVideo: removeVideoSpy, videos: videosSignal.asReadonly() },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VideoAdminComponent);
    component = fixture.componentInstance;

    httpMock = TestBed.inject(HttpTestingController);

    const req = httpMock.expectOne((r) =>
      r.method === 'GET' &&
      r.url === `${environment.apiUrl}/categories` &&
      r.params.get('type') === 'VIDEO'
    );
    req.flush(mockCategories);

    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should load categories from backend', () => {
    expect(component.categories.length).toBe(2);
    expect(component.categories[0].name).toBe('Bolos');
  });

  it('should not save if form is invalid', () => {
    component.form.patchValue({
      title: '',
      description: '',
      url: '',
    });

    component.save();
    expect(addVideoSpy).not.toHaveBeenCalled();
  });

  it('should call addVideo with VideoRequest when form is valid', async () => {
    component.form.patchValue({
      title: 'Bolo de Cenoura',
      description: 'Receita simples e deliciosa',
      url: 'assets/videos/bolo.mp4',
      cover: 'https://example.com/cover.jpg',
      categoryName: 'Bolos',
      recipe: 'Receita',
      protein: 3,
      carbs: 20,
      fat: 5,
      fiber: 2,
      calories: 120,
    });

    await component.save();

    expect(addVideoSpy).toHaveBeenCalledWith({
      title: 'Bolo de Cenoura',
      description: 'Receita simples e deliciosa',
      url: 'assets/videos/bolo.mp4',
      cover: 'https://example.com/cover.jpg',
      categoryId: 'cat-uuid-1',
      recipe: 'Receita',
      protein: 3,
      carbs: 20,
      fat: 5,
      fiber: 2,
      calories: 120,
    });
  });

  it('should create a new category when typed name does not exist', async () => {
    component.form.patchValue({
      title: 'Novo Video',
      description: 'Descricao',
      url: 'video.mp4',
      cover: '',
      categoryName: 'Doces',
    });

    const p = component.save();

    const createReq = httpMock.expectOne((r) => r.method === 'POST' && r.url === `${environment.apiUrl}/categories`);
    expect(createReq.request.body).toEqual({ name: 'Doces', type: 'VIDEO' });
    createReq.flush({ id: 'cat-new', name: 'Doces', type: 'VIDEO' });

    await p;

    expect(addVideoSpy).toHaveBeenCalledWith({
      title: 'Novo Video',
      description: 'Descricao',
      url: 'video.mp4',
      cover: 'video.mp4',
      categoryId: 'cat-new',
      recipe: '',
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      calories: 0,
    });
  });

  it('should reset form after successful save', async () => {
    component.form.patchValue({
      title: 'Test Video',
      description: 'Test Description',
      url: 'test.mp4',
      categoryName: 'Bolos',
    });

    await component.save();

    expect(component.form.get('title')?.value).toBe(null);
    expect(component.form.get('categoryName')?.value).toBe('');
  });

  it('should use video url as cover if cover is empty', async () => {
    component.form.patchValue({
      title: 'Test',
      description: 'Test Description',
      url: 'video.mp4',
      cover: '',
      categoryName: 'Bolos',
    });

    await component.save();

    const callArg = addVideoSpy.mock.calls[0][0];
    expect(callArg.cover).toBe('video.mp4');
  });

  it('should ask confirmation and call removeVideo when confirmed', () => {
    fixture.detectChanges();

    const btn = fixture.nativeElement.querySelector('[aria-label="Deletar vídeo"]') as HTMLButtonElement;
    btn.click();
    fixture.detectChanges();

    const confirm = fixture.nativeElement.querySelector('.confirm-btn') as HTMLButtonElement;
    confirm.click();

    expect(removeVideoSpy).toHaveBeenCalledWith('v1');
  });
});
