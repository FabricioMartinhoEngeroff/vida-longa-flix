import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RodapeComponent } from './rodape.component';

describe('RodapeComponent', () => {
  let component: RodapeComponent;
  let fixture: ComponentFixture<RodapeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RodapeComponent], 
    }).compileComponents();

    fixture = TestBed.createComponent(RodapeComponent);
    component = fixture.componentInstance;

    fixture.detectChanges(); 
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render footer texts', () => {
    const el: HTMLElement = fixture.nativeElement;

    expect(el.querySelector('footer.rodape')).toBeTruthy();
    expect(el.textContent).toContain('Receitas Saudáveis');
    expect(el.textContent).toContain('Dev Fabricio');
  });
});
