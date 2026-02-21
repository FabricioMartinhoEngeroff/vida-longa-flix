import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { HomeComponent } from './home.component';
import { CommentsService } from '../../shared/services/comments/comments.service';
import { ModalService } from '../../shared/services/modal/modal.service';
import { VideoService } from '../../shared/services/video/video.service';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  const videoServiceMock = {
    videos: () => [],
    toggleFavorite: vi.fn(),
  };

  const modalServiceMock = {
    open: vi.fn(),
  };

  const commentsServiceMock = {
  get: vi.fn((id: string) => {
    const state: Record<string, string[]> = {
      '10': ['Voce: teste'],
    };
    return state[id] ?? [];
  }),
};

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        { provide: VideoService, useValue: videoServiceMock },
        { provide: ModalService, useValue: modalServiceMock },
        { provide: CommentsService, useValue: commentsServiceMock },
        { provide: ActivatedRoute, useValue: { queryParams: of({}) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should count comments using video key', () => {
    expect(component.getTotalComments('10')).toBe(1);
    expect(component.getTotalComments('99')).toBe(0);
  });
});
