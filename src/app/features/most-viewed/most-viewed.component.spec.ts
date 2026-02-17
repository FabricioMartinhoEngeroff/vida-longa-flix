import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { signal } from '@angular/core';
import { MostViewedComponent } from './most-viewed.component';
import { VideoService } from '../../shared/services/video/video.service';
import { ModalService } from '../../shared/services/modal/modal.service';
import { ViewHistoryService } from '../../shared/services/view-history/view-history.service';

describe('MostViewedComponent', () => {
  let component: MostViewedComponent;
  let fixture: ComponentFixture<MostViewedComponent>;
  
  const videosSignal = signal([
    { id: '1', title: 'Video A', url: 'a.mp4' },
    { id: '2', title: 'Video B', url: 'b.mp4' },
  ] as any[]);

  const modalServiceMock = { open: vi.fn() };
  const videoServiceMock = {
    videos: videosSignal.asReadonly(),
  };
  const viewHistoryMock = {
    getViews: vi.fn().mockReturnValue({ '1': 3, '2': 0 }),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MostViewedComponent],
      providers: [
        { provide: VideoService, useValue: videoServiceMock },
        { provide: ModalService, useValue: modalServiceMock },
        { provide: ViewHistoryService, useValue: viewHistoryMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MostViewedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should keep only viewed videos ordered by views', () => {
    expect(component.sortedVideos.length).toBe(1);
    expect(component.sortedVideos[0].id).toBe('1');
    expect(component.sortedVideos[0].viewsCount).toBe(3);
  });

  it('should call modalService on openModal', () => {
    component.openModal({ id: '1' } as any);
    expect(modalServiceMock.open).toHaveBeenCalled();
  });

  it('should show empty message when no videos viewed', () => {
    viewHistoryMock.getViews.mockReturnValue({});
    component.ngOnInit();

    expect(component.sortedVideos.length).toBe(0);
  });

  it('should sort videos by view count descending', () => {
    viewHistoryMock.getViews.mockReturnValue({ '1': 5, '2': 10 });
    videosSignal.set([
      { id: '1', title: 'Video A', url: 'a.mp4' },
      { id: '2', title: 'Video B', url: 'b.mp4' },
    ] as any[]);

    component.ngOnInit();

    expect(component.sortedVideos[0].id).toBe('2');
    expect(component.sortedVideos[1].id).toBe('1');
  });
});