import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FavoriteButtonComponent } from '../favorite-button/favorite-button.component';

@Component({
  selector: 'app-comments-box',
  standalone: true,
  imports: [NgFor, FormsModule, FavoriteButtonComponent],
  templateUrl: './comments-box.component.html',
  styleUrls: ['./comments-box.component.css'],
})
export class CommentsBoxComponent {
  @Input() comments: string[] = [];
  @Input() isFavorite = false;

  @Output() favoriteClick = new EventEmitter<void>();
  @Output() commentSubmit = new EventEmitter<string>();

  newComment = '';

  submit(): void {
    const text = this.newComment.trim();
    if (!text) return;

    this.commentSubmit.emit(text);
    this.newComment = '';
  }
}
