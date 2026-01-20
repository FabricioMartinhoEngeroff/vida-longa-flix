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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render text', () => {
    component.text = 'Fazer login';
    fixture.detectChanges();

    const btn = fixture.debugElement.query(By.css('button')).nativeElement as HTMLButtonElement;
    expect(btn.textContent?.trim()).toBe('Fazer login');
  });

  it('should emit aoClicar when clicked', () => {
    const spy = spyOn(component.aoClicar, 'emit');

    const btn = fixture.debugElement.query(By.css('button')).nativeElement as HTMLButtonElement;
    btn.click();

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should not emit aoClicar when disabled', () => {
    component.disabled = true;
    fixture.detectChanges();

    const spy = spyOn(component.aoClicar, 'emit');

    const btn = fixture.debugElement.query(By.css('button')).nativeElement as HTMLButtonElement;
    btn.click();

    expect(spy).not.toHaveBeenCalled();
  });
});
