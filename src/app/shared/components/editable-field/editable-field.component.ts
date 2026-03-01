import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-editable-field',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './editable-field.component.html',
  styleUrls: ['./editable-field.component.css'],
})
export class EditableFieldComponent {
  @Input() value: string | number | null | undefined = '';
  @Input() fieldType: 'text' | 'textarea' | 'number' = 'text';
  @Input() canEdit = false;
  @Input() suffix = '';
  @Input() label = '';
  @Input() placeholder = '';
  @Input() emptyText = '';

  @Output() save = new EventEmitter<string | number>();

  editing = false;
  draft = '';

  get displayText(): string {
    if (this.value === null || this.value === undefined || this.value === '') return this.emptyText;
    return `${this.value}${this.suffix}`;
  }

  startEdit(): void {
    this.draft = this.value === null || this.value === undefined ? '' : String(this.value);
    this.editing = true;
  }

  confirmEdit(): void {
    const emitted = this.fieldType === 'number' ? Number(this.draft) : this.draft;
    this.save.emit(emitted);
    this.editing = false;
  }

  cancelEdit(): void {
    this.editing = false;
  }

  updateDraft(event: Event): void {
    this.draft = (event.target as HTMLInputElement | HTMLTextAreaElement).value;
  }
}
