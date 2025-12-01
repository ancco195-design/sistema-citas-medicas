import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleCita } from './detalle-cita';

describe('DetalleCita', () => {
  let component: DetalleCita;
  let fixture: ComponentFixture<DetalleCita>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleCita]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetalleCita);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
