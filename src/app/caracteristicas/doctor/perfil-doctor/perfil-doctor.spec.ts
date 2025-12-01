import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerfilDoctor } from './perfil-doctor';

describe('PerfilDoctor', () => {
  let component: PerfilDoctor;
  let fixture: ComponentFixture<PerfilDoctor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerfilDoctor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PerfilDoctor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
