import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { vi } from 'vitest';

import { InicioComponent } from './inicio.component';
import { ComentariosService } from '../../compartilhado/servicos/comentarios/comentarios.service';
import { ModalService } from '../../compartilhado/servicos/modal/modal';
import { VideoService } from '../../compartilhado/servicos/video/video';

describe('InicioComponent', () => {
  let component: InicioComponent;
  let fixture: ComponentFixture<InicioComponent>;

  const comentariosState$ = new BehaviorSubject<Record<string, string[]>>({});

  const videoServiceMock = {
    videosReels$: of([]),
    toggleFavorite: vi.fn(),
  };

  const modalServiceMock = {
    abrir: vi.fn(),
  };

  const comentariosServiceMock = {
    comentarios$: comentariosState$.asObservable(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InicioComponent],
      providers: [
        { provide: VideoService, useValue: videoServiceMock },
        { provide: ModalService, useValue: modalServiceMock },
        { provide: ComentariosService, useValue: comentariosServiceMock },
        { provide: ActivatedRoute, useValue: { queryParams: of({}) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InicioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve contar comentários usando chave de video', () => {
    comentariosState$.next({
      'video:10': ['Você: teste'],
      'cardapio:10': ['Você: outro'],
    });

    expect(component.totalComentarios('10')).toBe(1);
    expect(component.totalComentarios('99')).toBe(0);
  });
});
