import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-favorite-button',
  standalone: true,
  imports: [MatIconModule],
  templateUrl:'./favorite-button.component.html',
  styleUrls: ['./favorite-button.component.css'],
})
export class FavoriteButtonComponent {
  @Input() favorited = false;
  // eslint-disable-next-line @angular-eslint/no-output-native
  @Output() toggle = new EventEmitter<void>();

  onClick(): void {
    this.toggle.emit();
  }
}
