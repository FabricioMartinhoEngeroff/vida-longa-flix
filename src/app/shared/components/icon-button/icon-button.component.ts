import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-icon-button',
  standalone: true,
  templateUrl: './icon-button.component.html',
  styleUrls: ['./icon-button.component.css'],
})
export class IconButtonComponent {
  @Output() clickAction = new EventEmitter<void>();

  handleClick(): void {
    this.clickAction.emit();
  }
}
