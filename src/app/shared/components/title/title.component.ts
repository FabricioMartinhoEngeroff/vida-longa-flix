import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type TitleAlignment = 'left' | 'center' | 'right';

@Component({
  selector: 'app-title',
  templateUrl: './title.component.html',
  styleUrls: ['./title.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class TitleComponent {
  @Input() alignment: TitleAlignment = 'left';
}
