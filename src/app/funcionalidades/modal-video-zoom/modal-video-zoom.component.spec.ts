import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalVideoZoomComponent } from './modal-video-zoom.component';

describe('ModalVideoZoom', () => {
  let component: ModalVideoZoomComponent;
  let fixture: ComponentFixture<ModalVideoZoomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModalVideoZoomComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalVideoZoomComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
