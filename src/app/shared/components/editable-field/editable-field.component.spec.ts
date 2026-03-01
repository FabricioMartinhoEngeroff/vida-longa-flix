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

  it('should show edit button only when canEdit is true', () => {
    fixture.componentRef.setInput('value', 'Test');
    fixture.componentRef.setInput('canEdit', false);
    fixture.detectChanges(false);
    const btnWhenCantEdit = fixture.nativeElement.querySelector('.btn-edit');
    expect(btnWhenCantEdit).toBeTruthy();
    expect(btnWhenCantEdit.hidden).toBe(true);

    fixture.componentRef.setInput('canEdit', true);
    fixture.detectChanges(false);
    const btnWhenCanEdit = fixture.nativeElement.querySelector('.btn-edit');
    expect(btnWhenCanEdit).toBeTruthy();
    expect(btnWhenCanEdit.hidden).toBe(false);
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
});
