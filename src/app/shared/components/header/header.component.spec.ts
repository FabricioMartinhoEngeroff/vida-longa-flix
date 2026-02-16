import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';

import { HeaderComponent } from './header.component';
import { SearchFieldComponent } from '../search-field/search-field.component';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render logo', () => {
    const img: HTMLImageElement = fixture.nativeElement.querySelector('img.logo');
    expect(img).toBeTruthy();
    expect(img.getAttribute('src')).toContain('/assets/images/Logo.png');
  });

  it('should call onSearchChange when SearchField emits valueChange', () => {
    const onSearchChangeSpy = vi.spyOn(component, 'onSearchChange');

    const searchField = fixture.debugElement.query(By.directive(SearchFieldComponent));
    expect(searchField).toBeTruthy();

    searchField.componentInstance.valueChange.emit('banana');
    expect(onSearchChangeSpy).toHaveBeenCalledWith('banana');
  });
});
