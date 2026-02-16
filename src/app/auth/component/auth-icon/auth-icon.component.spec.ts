import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthIconComponent } from './auth-icon.component';

describe('AuthIconComponent', () => {
  let component: AuthIconComponent;
  let fixture: ComponentFixture<AuthIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthIconComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthIconComponent);
    component = fixture.componentInstance;
  });

  it('deve renderizar ícone padrão', () => {
    fixture.detectChanges();

    const svg = fixture.nativeElement.querySelector('svg');
    expect(svg).toBeTruthy();
  });

  it('deve renderizar fallback para ícone desconhecido', () => {
    component.name = 'inexistente' as any;
    fixture.detectChanges();

    const fallbackPath = fixture.nativeElement.querySelector('path[d="M12 12h.01"]');
    expect(fallbackPath).toBeTruthy();
  });
});
