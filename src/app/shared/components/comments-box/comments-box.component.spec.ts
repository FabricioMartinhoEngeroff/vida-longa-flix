import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { CommentsBoxComponent } from './comments-box.component';

describe('CommentsBoxComponent', () => {
  let component: CommentsBoxComponent;
  let fixture: ComponentFixture<CommentsBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommentsBoxComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CommentsBoxComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render title and comments', () => {
    component.comments = ['Primeiro', 'Segundo'];
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;

    expect(el.textContent).toContain('Comentários');
    expect(el.textContent).toContain('Primeiro');
    expect(el.textContent).toContain('Segundo');
  });

  it('should emit commentSubmit with trimmed text and then clear input', () => {
    const submitSpy = vi.spyOn(component.commentSubmit, 'emit');

    component.newComment = '  teste  ';
    fixture.detectChanges();

    component.submit();

    expect(submitSpy).toHaveBeenCalledWith('teste');
    expect(component.newComment).toBe('');
  });

  it('should submit on Enter keydown and clear input in the template', async () => {
    const submitSpy = vi.spyOn(component.commentSubmit, 'emit');
    fixture.detectChanges();
    await fixture.whenStable();

    const input = fixture.nativeElement.querySelector('.comment-form input') as HTMLInputElement;
    expect(input).toBeTruthy();

    input.value = 'hello';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();

    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(submitSpy).toHaveBeenCalledWith('hello');
    expect(component.newComment).toBe('');
  });

  it('should allow multiple sequential submissions via button click', async () => {
    const submitSpy = vi.spyOn(component.commentSubmit, 'emit');
    fixture.detectChanges();
    await fixture.whenStable();

    const el = fixture.nativeElement as HTMLElement;
    const input = el.querySelector('.comment-form input') as HTMLInputElement;
    const button = el.querySelector('.comment-form button') as HTMLButtonElement;
    expect(input).toBeTruthy();
    expect(button).toBeTruthy();

    for (let i = 1; i <= 5; i++) {
      input.value = `c${i}`;
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      await fixture.whenStable();

      button.click();
      fixture.detectChanges();
      await fixture.whenStable();
    }

    expect(submitSpy).toHaveBeenCalledTimes(5);
    expect((submitSpy as any).mock.calls[0][0]).toBe('c1');
    expect((submitSpy as any).mock.calls[4][0]).toBe('c5');
  });

  it('should not emit commentSubmit when input is empty/whitespace', () => {
    const submitSpy = vi.spyOn(component.commentSubmit, 'emit');

    component.newComment = '   ';
    fixture.detectChanges();

    component.submit();

    expect(submitSpy).not.toHaveBeenCalled();
    expect(component.newComment).toBe('   ');
  });

  it('should emit favoriteClick when favorite button output is triggered', () => {
    const favoriteSpy = vi.spyOn(component.favoriteClick, 'emit');
    fixture.detectChanges();
    component.favoriteClick.emit();

    expect(favoriteSpy).toHaveBeenCalled();
  });

  it('should render delete button and emit commentDelete when canDeleteComments=true', () => {
    const delSpy = vi.spyOn(component.commentDelete, 'emit');

    component.commentItems = [{ id: 'c1', text: 'oi', author: 'Ana' }];
    component.canDeleteComments = true;
    fixture.detectChanges();

    const btn = fixture.nativeElement.querySelector('.comment-trash') as HTMLButtonElement;
    expect(btn).toBeTruthy();

    btn.click();
    expect(delSpy).toHaveBeenCalledWith('c1');
  });
});
