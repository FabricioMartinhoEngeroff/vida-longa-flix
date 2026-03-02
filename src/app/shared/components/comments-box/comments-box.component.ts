import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { FavoriteButtonComponent } from '../favorite-button/favorite-button.component';

export interface CommentItem {
  id: string;
  text: string;
  author?: string;
  date?: string;
}

@Component({
  selector: 'app-comments-box',
  standalone: true,
  imports: [FormsModule, FavoriteButtonComponent, MatIconModule],
  templateUrl: './comments-box.component.html',
  styleUrls: ['./comments-box.component.css'],
})
export class CommentsBoxComponent {
  @Input() comments: string[] = [];
  @Input() commentItems: CommentItem[] | null = null;
  @Input() canDeleteComments = false;
  @Input() favorited = false;
  @Output() favoriteClick = new EventEmitter<void>();
  @Output() commentSubmit = new EventEmitter<string>();
  @Output() commentDelete = new EventEmitter<string>();

  newComment = '';

  submit(): void {
    const text = this.newComment.trim();
    if (!text) return;

    this.commentSubmit.emit(text);
    this.newComment = '';
  }
}
