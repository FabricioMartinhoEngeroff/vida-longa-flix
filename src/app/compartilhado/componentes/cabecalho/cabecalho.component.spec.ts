import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { CabecalhoComponent } from './cabecalho.component';
import { CampoPesquisarComponent } from '../campo-pesquisar/campo-pesquisar.component';

describe('CabecalhoComponent', () => {
  let component: CabecalhoComponent;
  let fixture: ComponentFixture<CabecalhoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CabecalhoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CabecalhoComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render logo', () => {
    const img: HTMLImageElement = fixture.nativeElement.querySelector('img.logo');
    expect(img).toBeTruthy();
    expect(img.getAttribute('src')).toContain('/assets/images/Logo.png');
  });

  it('should render title text', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Vida Longa Flix');
  });

  it('should call onPesquisar when CampoPesquisar emits valueChange', () => {
    spyOn(component, 'onPesquisar');

    const campoTexto = fixture.debugElement.query(By.directive(CampoPesquisarComponent));
    expect(campoTexto).toBeTruthy();

    campoTexto.componentInstance.valueChange.emit('banana');
    expect(component.onPesquisar).toHaveBeenCalledWith('banana');
  });

  it('should call abrirConfiguracoes when CampoTexto emits configuracaoClick', () => {
    spyOn(component, 'abrirConfiguracoes');

    const campoTexto = fixture.debugElement.query(By.directive(CampoPesquisarComponent));
    campoTexto.componentInstance.configuracaoClick.emit();

    expect(component.abrirConfiguracoes).toHaveBeenCalled();
  });
});
