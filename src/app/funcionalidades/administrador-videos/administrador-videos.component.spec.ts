import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { AdminVideosComponent } from './administrador-videos.component';
import { VideoService } from '../../shared/services/video/video';

describe('AdminVideosComponent', () => {
  let addVideoSpy: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    addVideoSpy = vi.fn();

    await TestBed.configureTestingModule({
      imports: [AdminVideosComponent],
      providers: [{ provide: VideoService, useValue: { addVideo: addVideoSpy } }],
    }).compileComponents();
  });

  it('deve criar o componente', () => {
    const fixture = TestBed.createComponent(AdminVideosComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('não deve salvar se o formulário estiver inválido', () => {
    const fixture = TestBed.createComponent(AdminVideosComponent);
    const component = fixture.componentInstance;

    component.form.patchValue({
      title: '',
      description: '',
      url: '',
    });

    component.salvar();
    expect(addVideoSpy).not.toHaveBeenCalled();
  });

  it('deve chamar addVideo quando o formulário estiver válido', () => {
    const fixture = TestBed.createComponent(AdminVideosComponent);
    const component = fixture.componentInstance;

    component.form.patchValue({
      title: 'Bolo de Cenoura',
      description: 'Receita simples e deliciosa',
      url: 'assets/videos/bolo.mp4',
      capa: 'https://example.com/capa.jpg',
      categoryName: 'Lanches',
      receita: 'Receita',
      proteinas: 3,
      carboidratos: 20,
      gorduras: 5,
      fibras: 2,
      calorias: 120,
    });

    component.salvar();
    expect(addVideoSpy).toHaveBeenCalled();
  });
});
