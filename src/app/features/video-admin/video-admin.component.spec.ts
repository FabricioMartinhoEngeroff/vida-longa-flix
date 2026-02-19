import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { vi } from 'vitest';
import { VideoAdminComponent } from './video-admin.component';
import { VideoService } from '../../shared/services/video/video.service';
import { environment } from '../../../environments/environment';

describe('VideoAdminComponent', () => {
  let component: VideoAdminComponent;
  let fixture: ComponentFixture<VideoAdminComponent>;
  let httpMock: HttpTestingController;
  let addVideoSpy: ReturnType<typeof vi.fn>;

  const mockCategories = [
    { id: 'cat-uuid-1', name: 'Bolos' },
    { id: 'cat-uuid-2', name: 'Salgados' },
  ];

  beforeEach(async () => {
    addVideoSpy = vi.fn();

    await TestBed.configureTestingModule({
      imports: [VideoAdminComponent, HttpClientTestingModule],
      providers: [{ provide: VideoService, useValue: { addVideo: addVideoSpy } }],
    }).compileComponents();

    fixture = TestBed.createComponent(VideoAdminComponent);
    component = fixture.componentInstance;

    httpMock = TestBed.inject(HttpTestingController);

    // Responde o GET de categorias do construtor
    const req = httpMock.expectOne(`${environment.apiUrl}/categories`);
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

  it('should call addVideo with VideoRequest when form is valid', () => {
    component.form.patchValue({
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

    component.save();

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

  it('should reset form after successful save', () => {
    component.form.patchValue({
      title: 'Test Video',
      description: 'Test Description',
      url: 'test.mp4',
      categoryId: 'cat-uuid-1',
    });

    component.save();

    expect(component.form.get('title')?.value).toBe(null);
    expect(component.form.get('categoryId')?.value).toBe('');
  });

  it('should use video url as cover if cover is empty', () => {
    component.form.patchValue({
      title: 'Test',
      description: 'Test Description',
      url: 'video.mp4',
      cover: '',
      categoryId: 'cat-uuid-1',
    });

    component.save();

    const callArg = addVideoSpy.mock.calls[0][0];
    expect(callArg.cover).toBe('video.mp4');
  });
});