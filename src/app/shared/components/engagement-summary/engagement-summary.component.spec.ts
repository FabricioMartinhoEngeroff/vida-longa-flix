import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { EngagementSummaryComponent } from './engagement-summary.component';

describe('EngagementSummaryComponent', () => {
  let component: EngagementSummaryComponent;
  let fixture: ComponentFixture<EngagementSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EngagementSummaryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EngagementSummaryComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render counters and active like icon', () => {
    component.likesCount = 12;
    component.commentsCount = 3;
    component.liked = true;
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const icons = Array.from(el.querySelectorAll('mat-icon')).map((i) =>
      i.textContent?.trim()
    );

    expect(el.textContent).toContain('12');
    expect(el.textContent).toContain('3');
    expect(icons).toContain('favorite');
  });

  it('should emit like and comments events when clicked', () => {
    const likeSpy = vi.spyOn(component.likeClick, 'emit');
    const commentsSpy = vi.spyOn(component.commentsClick, 'emit');
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('button');
    buttons[0].click();
    buttons[1].click();

    expect(likeSpy).toHaveBeenCalled();
    expect(commentsSpy).toHaveBeenCalled();
  });
});
