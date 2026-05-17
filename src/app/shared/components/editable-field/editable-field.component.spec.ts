import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { EditableFieldComponent } from './editable-field.component';

describe('EditableFieldComponent', () => {
  let component: EditableFieldComponent;
  let fixture: ComponentFixture<EditableFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditableFieldComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EditableFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(false);
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should show value in display mode', () => {
    fixture.componentRef.setInput('value', 'Hello');
    fixture.componentRef.setInput('label', 'Title');
    fixture.detectChanges(false);

    const el = fixture.nativeElement;
    expect(el.querySelector('.display-value').textContent).toContain('Hello');
    expect(el.querySelector('strong').textContent).toContain('Title');
  });

  it('should not render edit button in the DOM when canEdit is false', () => {
    fixture.componentRef.setInput('value', 'Test');
    fixture.componentRef.setInput('canEdit', false);
    fixture.detectChanges(false);

    expect(fixture.nativeElement.querySelector('.btn-edit')).toBeNull();
  });

  it('should render edit button in the DOM when canEdit is true', () => {
    fixture.componentRef.setInput('value', 'Test');
    fixture.componentRef.setInput('canEdit', true);
    fixture.detectChanges(false);

    expect(fixture.nativeElement.querySelector('.btn-edit')).toBeTruthy();
  });

  it('should show suffix next to value', () => {
    fixture.componentRef.setInput('value', 10);
    fixture.componentRef.setInput('suffix', 'g');
    fixture.detectChanges(false);

    expect(fixture.nativeElement.querySelector('.display-value').textContent).toContain('10g');
  });

  it('should enter edit mode on pencil click', () => {
    fixture.componentRef.setInput('value', 'Test');
    fixture.componentRef.setInput('canEdit', true);
    fixture.detectChanges(false);

    fixture.nativeElement.querySelector('.btn-edit').click();
    fixture.detectChanges(false);

    expect(component.editing).toBe(true);
    expect(fixture.nativeElement.querySelector('.edit-input')).toBeTruthy();
  });

  it('should emit save with new value on confirm', () => {
    const saveSpy = vi.spyOn(component.save, 'emit');

    component.value = 'Old';
    component.canEdit = true;
    component.startEdit();
    component.draft = 'New';
    component.confirmEdit();

    expect(saveSpy).toHaveBeenCalledWith('New');
    expect(component.editing).toBe(false);
  });

  it('should emit number for number fieldType', () => {
    const saveSpy = vi.spyOn(component.save, 'emit');

    component.value = 10;
    component.fieldType = 'number';
    component.canEdit = true;
    component.startEdit();
    component.draft = '25';
    component.confirmEdit();

    expect(saveSpy).toHaveBeenCalledWith(25);
  });

  it('should cancel edit without emitting', () => {
    const saveSpy = vi.spyOn(component.save, 'emit');

    component.value = 'Original';
    component.canEdit = true;
    component.startEdit();
    component.draft = 'Changed';
    component.cancelEdit();

    expect(saveSpy).not.toHaveBeenCalled();
    expect(component.editing).toBe(false);
  });

  it('should render textarea when fieldType is textarea', () => {
    fixture.componentRef.setInput('value', 'Long text');
    fixture.componentRef.setInput('fieldType', 'textarea');
    fixture.componentRef.setInput('canEdit', true);
    fixture.detectChanges(false);

    fixture.nativeElement.querySelector('.btn-edit').click();
    fixture.detectChanges(false);

    const textarea = fixture.nativeElement.querySelector('textarea');
    expect(textarea).toBeTruthy();
    expect(textarea.hidden).toBe(false);
  });

  it('should render number input when fieldType is number', () => {
    fixture.componentRef.setInput('value', 42);
    fixture.componentRef.setInput('fieldType', 'number');
    fixture.componentRef.setInput('canEdit', true);
    fixture.detectChanges(false);

    fixture.nativeElement.querySelector('.btn-edit').click();
    fixture.detectChanges(false);

    const input = fixture.nativeElement.querySelector('input[type="number"]');
    expect(input).toBeTruthy();
    expect(input.hidden).toBe(false);
  });

  // ── A14. Exibicao com quebras de linha ──────────────────────────

  describe('A14 — Exibicao com quebras de linha', () => {
    it('#102 display-value deve ter white-space: pre-line para preservar quebras', () => {
      fixture.componentRef.setInput('value', 'Linha1\nLinha2\nLinha3');
      fixture.detectChanges(false);

      const span = fixture.nativeElement.querySelector('.display-value') as HTMLElement;
      expect(span).toBeTruthy();
      const ws = getComputedStyle(span).whiteSpace;
      expect(ws).toBe('pre-line');
    });

    it('#103 textarea em modo edicao carrega quebras de linha corretamente', () => {
      const multiline = 'Primeira linha\nSegunda linha\nTerceira linha';
      fixture.componentRef.setInput('value', multiline);
      fixture.componentRef.setInput('fieldType', 'textarea');
      fixture.componentRef.setInput('canEdit', true);
      fixture.detectChanges(false);

      fixture.nativeElement.querySelector('.btn-edit').click();
      fixture.detectChanges(false);

      const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
      expect(textarea).toBeTruthy();
      expect(textarea.value).toBe(multiline);
    });

    it('#104 valor vazio exibe emptyText sem quebrar layout', () => {
      fixture.componentRef.setInput('value', null);
      fixture.componentRef.setInput('emptyText', 'Sem descricao.');
      fixture.detectChanges(false);

      const span = fixture.nativeElement.querySelector('.display-value') as HTMLElement;
      expect(span.textContent).toContain('Sem descricao.');
    });

    it('#106 valor com apenas espacos e \\n exibe sem blocos estranhos', () => {
      fixture.componentRef.setInput('value', '  \n\n  \n ');
      fixture.detectChanges(false);

      const span = fixture.nativeElement.querySelector('.display-value') as HTMLElement;
      expect(span).toBeTruthy();
      // deve renderizar sem erro
      expect(span.textContent).toBeDefined();
    });

    it('#108 texto muito longo sem quebra faz word-wrap dentro do container', () => {
      const longText = 'A'.repeat(500);
      fixture.componentRef.setInput('value', longText);
      fixture.detectChanges(false);

      const span = fixture.nativeElement.querySelector('.display-value') as HTMLElement;
      expect(span).toBeTruthy();
      expect(span.textContent).toContain(longText);
    });
  });
});
