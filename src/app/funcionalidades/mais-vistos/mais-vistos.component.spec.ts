import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MaisVistosComponent } from './mais-vistos.component';
import { VideoService } from '../../shared/services/video/video';
import { ModalService } from '../../shared/services/modal/modal';
import { HistoricoViewsService } from '../../shared/services/historico-views/historico-views';
import { vi } from 'vitest';

describe('MaisVistosComponent', () => {
  let component: MaisVistosComponent;
  let fixture: ComponentFixture<MaisVistosComponent>;
  const modalServiceMock = { abrir: vi.fn() };
  const videoServiceMock = {
    videosReels: [
      { id: '1', title: 'Video A', url: 'a.mp4' },
      { id: '2', title: 'Video B', url: 'b.mp4' },
    ] as any[],
  };
  const historicoViewsMock = {
    getViews: vi.fn().mockReturnValue({ '1': 3, '2': 0 }),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaisVistosComponent],
      providers: [
        { provide: VideoService, useValue: videoServiceMock },
        { provide: ModalService, useValue: modalServiceMock },
        { provide: HistoricoViewsService, useValue: historicoViewsMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MaisVistosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should keep only viewed videos ordered by views', () => {
    expect(component.videosOrdenados.length).toBe(1);
    expect(component.videosOrdenados[0].id).toBe('1');
  });

  it('should call modalService on abrirModal', () => {
    component.abrirModal({ id: '1' } as any);
    expect(modalServiceMock.abrir).toHaveBeenCalled();
  });
});
