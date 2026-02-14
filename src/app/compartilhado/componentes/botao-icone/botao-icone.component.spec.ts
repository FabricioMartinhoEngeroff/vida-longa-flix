import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';

import { BotaoIconeComponent } from './botao-icone.component';

describe('BotaoIconeComponent', () => {
  let component: BotaoIconeComponent;
  let fixture: ComponentFixture<BotaoIconeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BotaoIconeComponent], 
    }).compileComponents();

    fixture = TestBed.createComponent(BotaoIconeComponent);
    component = fixture.componentInstance;

    fixture.detectChanges(); 
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit aoClicar when button is clicked', () => {
    const emitSpy = vi.spyOn(component.aoClicar, 'emit');

    const button = fixture.debugElement.query(By.css('button.botao-icone'));
    button.triggerEventHandler('click', null);

    expect(emitSpy).toHaveBeenCalled();
  });
});
