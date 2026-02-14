import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BotaoPrimarioComponent } from './botao-primario.component';

describe('BotaoPrimarioComponent', () => {
  let component: BotaoPrimarioComponent;
  let fixture: ComponentFixture<BotaoPrimarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BotaoPrimarioComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BotaoPrimarioComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should reflect disabled input', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const btn = fixture.debugElement.query(By.css('button')).nativeElement as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it('should render button type', () => {
    fixture.componentRef.setInput('type', 'button');
    fixture.detectChanges();

    const btn = fixture.debugElement.query(By.css('button')).nativeElement as HTMLButtonElement;
    expect(btn.type).toBe('button');
  });
});
