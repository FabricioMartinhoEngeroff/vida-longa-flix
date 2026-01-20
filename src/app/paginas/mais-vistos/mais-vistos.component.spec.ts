import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaisVistosComponent } from './mais-vistos.component';
import { VideoService } from '../../services/video/video';
import { ModalService } from '../../services/modal/modal';

describe('MaisVistosComponent', () => {
  let component: MaisVistosComponent;
  let fixture: ComponentFixture<MaisVistosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaisVistosComponent],
      providers: [VideoService, ModalService],
    }).compileComponents();

    fixture = TestBed.createComponent(MaisVistosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
