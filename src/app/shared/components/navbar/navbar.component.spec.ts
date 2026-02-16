import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { vi } from 'vitest';
import { NavbarComponent } from './navbar.component';
import { NavItemComponent } from '../nav-item/nav-item.component';
import { UserAuthenticationService } from '../../../auth/services/user-authentication.service';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let events$: Subject<any>;

  const authMock = { user: null };
  const routerMock = { 
    navigate: vi.fn(), 
    url: '/', 
    events: new Subject<any>().asObservable() 
  };

  beforeEach(async () => {
    events$ = new Subject<any>();
    routerMock.navigate.mockReset();
    routerMock.url = '/';
    routerMock.events = events$.asObservable();

    await TestBed.configureTestingModule({
      imports: [NavbarComponent], 
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: UserAuthenticationService, useValue: authMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;

    fixture.detectChanges(); 
    await fixture.whenStable();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should render menu items', () => {
    const items = fixture.debugElement.queryAll(By.directive(NavItemComponent));
    expect(items.length).toBe(component.visibleItems.length);
  });

  it('should navigate when clicking a menu item', () => {
    const item = component.items[0];
    component.clickItem(item);
    expect(routerMock.navigate).toHaveBeenCalledWith([item.path]);
  });

  it('should set item as active from route url', () => {
    routerMock.url = '/app/favorites';
    events$.next(new NavigationEnd(1, '/app/favorites', '/app/favorites'));
    expect(component.active).toBe('Favoritos');
  });
});