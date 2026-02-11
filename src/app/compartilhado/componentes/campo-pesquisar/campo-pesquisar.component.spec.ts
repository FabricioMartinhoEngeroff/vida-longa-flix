import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CampoPesquisarComponent } from './campo-pesquisar.component';

describe('CampoPesquisarComponent', () => {
  let component: CampoPesquisarComponent;
  let fixture: ComponentFixture<CampoPesquisarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CampoPesquisarComponent], 
    }).compileComponents();

    fixture = TestBed.createComponent(CampoPesquisarComponent);
    component = fixture.componentInstance;

    component.placeholder = 'Pesquisar...';
    component.value = '';
    component.disabled = false;

    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render input with placeholder', () => {
    const input = fixture.debugElement.query(By.css('input.campo-texto-estilizado'))
      .nativeElement as HTMLInputElement;

    expect(input).toBeTruthy();
    expect(input.placeholder).toBe('Pesquisar...');
  });

  it('should emit valueChange when typing', () => {
    spyOn(component.valueChange, 'emit');

    const input = fixture.debugElement.query(By.css('input.campo-texto-estilizado'))
      .nativeElement as HTMLInputElement;

    input.value = 'banana';
    input.dispatchEvent(new Event('input'));

    expect(component.valueChange.emit).toHaveBeenCalledWith('banana');
  });

  it('should emit configuracaoClick when clicking config button', () => {
    spyOn(component.configuracaoClick, 'emit');

    const btn = fixture.debugElement.query(By.css('button.configuracao-container'));
    btn.triggerEventHandler('click', null);

    expect(component.configuracaoClick.emit).toHaveBeenCalled();
  });

  it('should not emit events when disabled', () => {
    component.disabled = true;
    fixture.detectChanges();

    spyOn(component.valueChange, 'emit');
    spyOn(component.configuracaoClick, 'emit');

    const input = fixture.debugElement.query(By.css('input.campo-texto-estilizado'))
      .nativeElement as HTMLInputElement;

    input.value = 'teste';
    input.dispatchEvent(new Event('input'));

    const btn = fixture.debugElement.query(By.css('button.configuracao-container'));
    btn.triggerEventHandler('click', null);

    expect(component.valueChange.emit).not.toHaveBeenCalled();
    expect(component.configuracaoClick.emit).not.toHaveBeenCalled();
  });
});
