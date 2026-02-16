import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthorizationComponent } from './authorization.component';

describe('AuthorizationComponent', () => {
  let component: AuthorizationComponent;
  let fixture: ComponentFixture<AuthorizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthorizationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthorizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should start with isRegistering false', () => {
    expect(component.isRegistering).toBe(false);
  });

  it('should toggle mode', () => {
    component.toggleMode();
    expect(component.isRegistering).toBe(true);

    component.toggleMode();
    expect(component.isRegistering).toBe(false);
  });
});