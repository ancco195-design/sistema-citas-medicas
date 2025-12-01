import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgendaDoctor } from './agenda-doctor';

describe('AgendaDoctor', () => {
  let component: AgendaDoctor;
  let fixture: ComponentFixture<AgendaDoctor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgendaDoctor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgendaDoctor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
