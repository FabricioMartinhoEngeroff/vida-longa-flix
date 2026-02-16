import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-nav-item',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './nav-item.component.html',
  styleUrls: ['./nav-item.component.css'],
})
export class NavItemComponent {
 
  @Input() text = '';
  @Input() icon = '';
  @Input() active = false;

  @Output() itemClick = new EventEmitter<void>();

  onClick() {
    this.itemClick.emit();
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onClick();
    }
  }
}