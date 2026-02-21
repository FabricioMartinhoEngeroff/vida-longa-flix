import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { MenusComponent } from './menus.component';
import { MenuService } from '../../shared/services/menus/menus-service';
import { MenuCommentsService } from '../../shared/services/menus/menu-comments-service';

describe('MenusComponent', () => {
  let commentsState: Record<string, string[]> = {};

  const menuServiceMock = {
    menus: () => [],
    toggleFavorite: vi.fn(),
  };

  const commentsServiceMock = {
    comments: () => commentsState,
    add: vi.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenusComponent],
      providers: [
        { provide: MenuService, useValue: menuServiceMock },
        { provide: MenuCommentsService, useValue: commentsServiceMock },
        { provide: ActivatedRoute, useValue: { queryParams: of({}) } },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(MenusComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should count and get comments by id', () => {
    const fixture = TestBed.createComponent(MenusComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    commentsState = { '7': ['Você: ótimo'] };

    expect(component.getTotalComments('7')).toBe(1);
    expect(component.getMenuComments('7')).toEqual(['Você: ótimo']);
  });

  it('should add comment', () => {
    const fixture = TestBed.createComponent(MenusComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.addComment('42', 'novo');

    expect(commentsServiceMock.add).toHaveBeenCalledWith('42', 'novo');
  });
});