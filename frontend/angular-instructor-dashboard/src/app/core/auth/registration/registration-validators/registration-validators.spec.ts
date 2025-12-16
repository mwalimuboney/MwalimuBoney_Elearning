import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrationValidators } from './registration-validators';

describe('RegistrationValidators', () => {
  let component: RegistrationValidators;
  let fixture: ComponentFixture<RegistrationValidators>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrationValidators]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistrationValidators);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
