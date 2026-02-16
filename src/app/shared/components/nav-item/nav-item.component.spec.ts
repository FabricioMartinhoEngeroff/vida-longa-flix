import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';
import { NavItemComponent } from './nav-item.component';

describe('NavItemComponent', () => {
  let component: NavItemComponent;
  let fixture: ComponentFixture<NavItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavItemComponent], 
    }).compileComponents();

    fixture = TestBed.createComponent(NavItemComponent);
    component = fixture.componentInstance;
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should render text and icon', () => {
    component.text = 'Início';
    component.icon = 'home';
    component.active = false;
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;

    expect(el.textContent).toContain('Início');

    const icon = el.querySelector('mat-icon.icon') as HTMLElement;
    expect(icon).toBeTruthy();
    expect(icon.textContent?.trim()).toBe('home');
  });

  it('should emit itemClick when clicked', () => {
    component.text = 'Início';
    component.icon = 'home';
    fixture.detectChanges();
    
    const emitSpy = vi.spyOn(component.itemClick, 'emit');

    const button = fixture.debugElement.query(By.css('.item'));
    button.triggerEventHandler('click', null);

    expect(emitSpy).toHaveBeenCalled();
  });

  it('should apply active class when active=true', () => {
    component.text = 'Início';
    component.icon = 'home';
    component.active = true;
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    const item = el.querySelector('.item');

    expect(item?.classList.contains('active')).toBe(true);
  });

  it('should emit itemClick on Enter key', () => {
    component.text = 'Início';
    component.icon = 'home';
    fixture.detectChanges();
    
    const emitSpy = vi.spyOn(component.itemClick, 'emit');

    const button = fixture.debugElement.query(By.css('.item'));
    button.triggerEventHandler('keydown', { key: 'Enter', preventDefault: () => {} });

    expect(emitSpy).toHaveBeenCalled();
  });

  it('should emit itemClick on Space key', () => {
    component.text = 'Início';
    component.icon = 'home';
    fixture.detectChanges();
    
    const emitSpy = vi.spyOn(component.itemClick, 'emit');

    const button = fixture.debugElement.query(By.css('.item'));
    button.triggerEventHandler('keydown', { key: ' ', preventDefault: () => {} });

    expect(emitSpy).toHaveBeenCalled();
  });
});