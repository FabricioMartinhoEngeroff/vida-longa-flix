import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PasswordStrengthIndicatorComponent } from './password-strength-indicator.component';
import { PasswordStrength } from '../../utils/strong-password-validator';

describe('PasswordStrengthIndicatorComponent', () => {
  let component: PasswordStrengthIndicatorComponent;
  let fixture: ComponentFixture<PasswordStrengthIndicatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordStrengthIndicatorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PasswordStrengthIndicatorComponent);
    component = fixture.componentInstance;
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate password strength on input change', () => {
    component.password = 'StrongPass1!';
    component.ngOnChanges();

    expect(component.result.strength).toBe(PasswordStrength.VERY_STRONG);
  });

  it('should hide requirements list when showRequirements=false', () => {
    component.password = 'abc';
    component.showRequirements = false;
    fixture.detectChanges();

    const list = fixture.nativeElement.querySelector('.requirements-list');
    expect(list).toBeNull();
  });
});