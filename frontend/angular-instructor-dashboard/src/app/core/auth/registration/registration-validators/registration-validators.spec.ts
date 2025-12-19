import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrationValidatorsComponent } from './registration-validators';

describe('RegistrationValidatorsComponent', () => {
  let component: RegistrationValidatorsComponent;
  let fixture: ComponentFixture<RegistrationValidatorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrationValidatorsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistrationValidatorsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
