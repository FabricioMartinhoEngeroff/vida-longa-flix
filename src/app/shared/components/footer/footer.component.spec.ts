import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render footer texts', () => {
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelector('footer.footer')).toBeTruthy();
    expect(element.textContent).toContain('Receitas Saudáveis');
    expect(element.textContent).toContain('Dev Fabricio');
  });
});
