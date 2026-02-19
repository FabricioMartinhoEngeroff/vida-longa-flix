import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { signal } from '@angular/core';
import { MostViewedComponent } from './most-viewed.component';
import { VideoService } from '../../shared/services/video/video.service';
import { ModalService } from '../../shared/services/modal/modal.service';

describe('MostViewedComponent', () => {
  let component: MostViewedComponent;
  let fixture: ComponentFixture<MostViewedComponent>;

  const videosSignal = signal([
    { id: '1', title: 'Video A', url: 'a.mp4', views: 10 },
    { id: '2', title: 'Video B', url: 'b.mp4', views: 0 },
    { id: '3', title: 'Video C', url: 'c.mp4', views: 25 },
  ] as any[]);

  const modalServiceMock = { open: vi.fn() };
  const videoServiceMock = {
    videos: videosSignal.asReadonly(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MostViewedComponent],
      providers: [
        { provide: VideoService, useValue: videoServiceMock },
        { provide: ModalService, useValue: modalServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MostViewedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should keep only videos with views > 0, sorted descending', () => {
    expect(component.sortedVideos.length).toBe(2);
    expect(component.sortedVideos[0].id).toBe('3');  // 25 views
    expect(component.sortedVideos[1].id).toBe('1');  // 10 views
  });

  it('should call modalService on openModal', () => {
    component.openModal({ id: '1' } as any);
    expect(modalServiceMock.open).toHaveBeenCalled();
  });

  it('should show empty list when no videos have views', () => {
    videosSignal.set([
      { id: '1', title: 'Video A', url: 'a.mp4', views: 0 },
      { id: '2', title: 'Video B', url: 'b.mp4', views: 0 },
    ] as any[]);

    component.ngOnInit();
    expect(component.sortedVideos.length).toBe(0);
  });

  it('should re-sort when views change', () => {
    videosSignal.set([
      { id: '1', title: 'Video A', url: 'a.mp4', views: 50 },
      { id: '2', title: 'Video B', url: 'b.mp4', views: 30 },
      { id: '3', title: 'Video C', url: 'c.mp4', views: 100 },
    ] as any[]);

    component.ngOnInit();

    expect(component.sortedVideos[0].id).toBe('3');  // 100
    expect(component.sortedVideos[1].id).toBe('1');  // 50
    expect(component.sortedVideos[2].id).toBe('2');  // 30
  });
});