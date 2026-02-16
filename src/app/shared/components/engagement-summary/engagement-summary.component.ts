import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-engagement-summary',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './engagement-summary.component.html',
  styleUrls: ['./engagement-summary.component.css'],
})
export class EngagementSummaryComponent {
  @Input() likesCount = 0;
  @Input() commentsCount = 0;
  @Input() liked = false;

  @Output() likeClick = new EventEmitter<void>();
  @Output() commentsClick = new EventEmitter<void>();

  onLike(event: MouseEvent): void {
    event.stopPropagation();
    this.likeClick.emit();
  }

  onComments(event: MouseEvent): void {
    event.stopPropagation();
    this.commentsClick.emit();
  }
}
