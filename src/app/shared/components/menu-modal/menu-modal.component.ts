import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommentsBoxComponent } from '../comments-box/comments-box.component';
import { Menu } from '../../types/menus.types';

@Component({
  selector: 'app-menu-modal',
  standalone: true,
  imports: [CommentsBoxComponent],
  templateUrl: './menu-modal.component.html',
  styleUrls: ['./menu-modal.component.css'],
})
export class MenuModalComponent {
  @Input() menu: Menu | null = null;
  @Input() comments: string[] = [];

  @Output() close = new EventEmitter<void>();
  @Output() favorite = new EventEmitter<void>();
  @Output() comment = new EventEmitter<string>();
}