import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { MensagemInfoComponent } from './mensagem-info.component';
import { NotificacaoService } from '../../servicos/mensagem-alerta/mensagem-alerta.service';

describe('MensagemInfoComponent', () => {
  let component: MensagemInfoComponent;
  let fixture: ComponentFixture<MensagemInfoComponent>;
  let notificacaoService: NotificacaoService;

  beforeEach(async () => {
    vi.useFakeTimers();

    await TestBed.configureTestingModule({
      imports: [MensagemInfoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MensagemInfoComponent);
    component = fixture.componentInstance;
    notificacaoService = TestBed.inject(NotificacaoService);
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('deve exibir mensagem de info recebida pelo serviço', () => {
    notificacaoService.info('Texto de info', 'Informação', 1000);

    expect(component.visivel).toBe(true);
    expect(component.texto).toBe('Texto de info');
    expect(component.titulo).toBe('Informação');
  });

  it('deve ocultar automaticamente após a duração', () => {
    notificacaoService.info('Texto', 'Informação', 1000);
    expect(component.visivel).toBe(true);

    vi.advanceTimersByTime(1000);

    expect(component.visivel).toBe(false);
  });

  it('deve fechar manualmente ao chamar fechar()', () => {
    notificacaoService.info('Texto', 'Informação', 1000);
    component.fechar();

    expect(component.visivel).toBe(false);
  });
});
