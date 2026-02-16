import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { vi } from 'vitest';

import { ModalVideoZoomComponent } from './modal-video-zoom.component';
import { ComentariosService } from '../../shared/services/comentarios/comentarios.service';
import { ModalService } from '../../shared/services/modal/modal';
import { VideoService } from '../../shared/services/video/video';

describe('ModalVideoZoomComponent', () => {
  let component: ModalVideoZoomComponent;
  let fixture: ComponentFixture<ModalVideoZoomComponent>;

  const videoSelecionado$ = new BehaviorSubject<any>(null);
  const comentarios$ = new BehaviorSubject<Record<string, string[]>>({});

  const modalServiceMock = {
    videoSelecionado$: videoSelecionado$.asObservable(),
    fechar: vi.fn(),
  };

  const videoServiceMock = {
    videosReels: [] as any[],
    toggleFavorite: vi.fn(),
  };

  const comentariosServiceMock = {
    comentarios$: comentarios$.asObservable(),
    get: vi.fn().mockReturnValue([]),
    add: vi.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalVideoZoomComponent],
      providers: [
        { provide: ModalService, useValue: modalServiceMock },
        { provide: VideoService, useValue: videoServiceMock },
        { provide: ComentariosService, useValue: comentariosServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalVideoZoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve adicionar comentário com tipo video', () => {
    component.videoAtualizado = { id: '5' } as any;

    component.adicionarComentario('teste');

    expect(comentariosServiceMock.add).toHaveBeenCalledWith(
      'video',
      '5',
      'teste'
    );
  });
});
