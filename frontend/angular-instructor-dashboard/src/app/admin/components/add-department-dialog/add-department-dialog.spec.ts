import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDepartmentDialog } from './add-department-dialog';

describe('AddDepartmentDialog', () => {
  let component: AddDepartmentDialog;
  let fixture: ComponentFixture<AddDepartmentDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddDepartmentDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddDepartmentDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
