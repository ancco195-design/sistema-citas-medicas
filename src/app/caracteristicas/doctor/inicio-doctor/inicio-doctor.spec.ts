import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InicioDoctor } from './inicio-doctor';

describe('InicioDoctor', () => {
  let component: InicioDoctor;
  let fixture: ComponentFixture<InicioDoctor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InicioDoctor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InicioDoctor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
