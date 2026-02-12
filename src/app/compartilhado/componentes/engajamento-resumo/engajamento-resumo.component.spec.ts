import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EngajamentoResumoComponent } from './engajamento-resumo.component';

describe('EngajamentoResumoComponent', () => {
  let component: EngajamentoResumoComponent;
  let fixture: ComponentFixture<EngajamentoResumoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EngajamentoResumoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EngajamentoResumoComponent);
    component = fixture.componentInstance;
  });

  it('deve criar o componente', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('deve renderizar contadores e ícone de curtida ativo', () => {
    component.likesCount = 12;
    component.commentsCount = 3;
    component.liked = true;
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const icons = Array.from(el.querySelectorAll('mat-icon')).map((i) =>
      i.textContent?.trim()
    );

    expect(el.textContent).toContain('12');
    expect(el.textContent).toContain('3');
    expect(icons).toContain('favorite');
  });

  it('deve emitir eventos de like e comentários ao clicar', () => {
    spyOn(component.likeClick, 'emit');
    spyOn(component.commentsClick, 'emit');
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('button');
    buttons[0].click();
    buttons[1].click();

    expect(component.likeClick.emit).toHaveBeenCalled();
    expect(component.commentsClick.emit).toHaveBeenCalled();
  });
});
