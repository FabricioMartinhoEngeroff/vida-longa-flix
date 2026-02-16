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
});
