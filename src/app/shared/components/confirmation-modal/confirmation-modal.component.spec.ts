import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { ConfirmationModalComponent } from './confirmation-modal.component';

describe('ConfirmationModalComponent', () => {
  let component: ConfirmationModalComponent;
  let fixture: ComponentFixture<ConfirmationModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmationModalComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmationModalComponent);
    component = fixture.componentInstance;
    component.open = true;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should display title and message', () => {
    component.title = 'Test Title';
    component.message = 'Test Message';
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.title').textContent).toContain('Test Title');
    expect(compiled.querySelector('.message').textContent).toContain('Test Message');
  });

  it('should emit confirm when confirm button is clicked', () => {
    const emitSpy = vi.spyOn(component.confirm, 'emit');
    
    const confirmBtn = fixture.nativeElement.querySelector('.confirm-btn');
    confirmBtn.click();
    
    expect(emitSpy).toHaveBeenCalled();
  });

  it('should emit cancel when cancel button is clicked', () => {
    const emitSpy = vi.spyOn(component.cancel, 'emit');
    
    const cancelBtn = fixture.nativeElement.querySelector('.cancel-btn');
    cancelBtn.click();
    
    expect(emitSpy).toHaveBeenCalled();
  });

  it('should emit cancel when close button is clicked', () => {
    const emitSpy = vi.spyOn(component.cancel, 'emit');
    
    const closeBtn = fixture.nativeElement.querySelector('.close-btn');
    closeBtn.click();
    
    expect(emitSpy).toHaveBeenCalled();
  });

  it('should emit cancel when backdrop is clicked', () => {
    const emitSpy = vi.spyOn(component.cancel, 'emit');
    
    const backdrop = fixture.nativeElement.querySelector('.backdrop');
    backdrop.click();
    
    expect(emitSpy).toHaveBeenCalled();
  });

  it('should display custom button texts', () => {
    component.confirmText = 'Yes';
    component.cancelText = 'No';
    fixture.detectChanges();

    const confirmBtn = fixture.nativeElement.querySelector('.confirm-btn');
    const cancelBtn = fixture.nativeElement.querySelector('.cancel-btn');
    
    expect(confirmBtn.textContent.trim()).toBe('Yes');
    expect(cancelBtn.textContent.trim()).toBe('No');
  });

  it('should apply danger class when isDanger is true', () => {
    component.isDanger = true;
    fixture.detectChanges();

    const confirmBtn = fixture.nativeElement.querySelector('.confirm-btn');
    expect(confirmBtn.classList.contains('danger')).toBe(true);
  });

  it('should not render when open is false', () => {
    component.open = false;
    fixture.detectChanges();

    const backdrop = fixture.nativeElement.querySelector('.backdrop');
    expect(backdrop).toBeNull();
  });
});