import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommentsBoxComponent } from '../comments-box/comments-box.component';
import { EditableFieldComponent } from '../editable-field/editable-field.component';
import { Menu } from '../../types/menu';

@Component({
  selector: 'app-menu-modal',
  standalone: true,
  imports: [CommentsBoxComponent, EditableFieldComponent],
  templateUrl: './menu-modal.component.html',
  styleUrls: ['./menu-modal.component.css'],
})
export class MenuModalComponent {
  @Input() menu: Menu | null = null;
  @Input() comments: string[] = [];
  @Input() canDeleteComments = false;
  @Input() canEdit = false;

  // eslint-disable-next-line @angular-eslint/no-output-native
  @Output() close = new EventEmitter<void>();
  @Output() favorite = new EventEmitter<void>();
  @Output() comment = new EventEmitter<string>();
  @Output() commentDelete = new EventEmitter<string>();
  @Output() fieldSave = new EventEmitter<{ field: string; value: string | number }>();

  onFieldSave(field: string, value: string | number): void {
    this.fieldSave.emit({ field, value });
  }
}