import { Component, EventEmitter, Input, Output, ViewChild, ElementRef } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-search-field',
  templateUrl: './search-field.component.html',
  styleUrls: ['./search-field.component.css'],
  standalone: true,
  imports: [MatIconModule],
})
export class SearchFieldComponent {
  
  @Input() placeholder = 'Pesquisar...';
  @Input() value = '';
  @Input() disabled = false;

  @Input() categories: string[] = [];
  @Input() suggestions: string[] = [];

 
  @Output() valueChange = new EventEmitter<string>();
  @Output() search = new EventEmitter<string>();

  @ViewChild('inputEl') inputEl?: ElementRef<HTMLInputElement>;


  isOpen = false;

  open(): void {
    if (this.disabled) return;
    this.isOpen = true;
    setTimeout(() => this.inputEl?.nativeElement.focus(), 0);
  }

  close(): void {
    this.isOpen = false;
  }

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.value = input.value;
    this.valueChange.emit(this.value);
  }

  choose(text: string): void {
    this.value = text;
    this.valueChange.emit(text);
    this.search.emit(text);
    this.isOpen = false;
  }

  confirmSearch(): void {
    const term = (this.value || '').trim();
    if (term) this.search.emit(term);
    this.isOpen = false;
  }
}
