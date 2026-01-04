import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassRegistration } from './class-registration';

describe('ClassRegistration', () => {
  let component: ClassRegistration;
  let fixture: ComponentFixture<ClassRegistration>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClassRegistration]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClassRegistration);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
