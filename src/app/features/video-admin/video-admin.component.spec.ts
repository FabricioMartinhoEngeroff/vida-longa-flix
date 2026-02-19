import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { VideoAdminComponent } from './video-admin.component';
import { VideoService } from '../../shared/services/video/video.service';

describe('VideoAdminComponent', () => {
  let component: VideoAdminComponent;
  let fixture: ComponentFixture<VideoAdminComponent>;
  let addVideoSpy: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    addVideoSpy = vi.fn();

    await TestBed.configureTestingModule({
      imports: [VideoAdminComponent],
      providers: [{ provide: VideoService, useValue: { addVideo: addVideoSpy } }],
    }).compileComponents();

    fixture = TestBed.createComponent(VideoAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
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

  it('should call addVideo when form is valid', () => {
    component.form.patchValue({
      title: 'Bolo de Cenoura',
      description: 'Receita simples e deliciosa',
      url: 'assets/videos/bolo.mp4',
      cover: 'https://example.com/cover.jpg',
      categoryName: 'Lanches',
      recipe: 'Receita',
      protein: 3,
      carbs: 20,
      fat: 5,
      fiber: 2,
      calories: 120,
    });

    component.save();
    expect(addVideoSpy).toHaveBeenCalled();
  });

  it('should reset form after successful save', () => {
    component.form.patchValue({
      title: 'Test Video',
      description: 'Test Description',
      url: 'test.mp4',
    });

    component.save();

    expect(component.form.get('title')?.value).toBe(null);
    expect(component.form.get('categoryName')?.value).toBe('Sem categoria');
  });

  it('should use video url as cover if cover is empty', () => {
    component.form.patchValue({
      title: 'Test',
      description: 'Test Description',
      url: 'video.mp4',
      cover: '',
    });

    component.save();

    const callArg = addVideoSpy.mock.calls[0][0];
    expect(callArg.cover).toBe('video.mp4');
  });
});