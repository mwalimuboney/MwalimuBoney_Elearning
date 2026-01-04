import { TestBed } from '@angular/core/testing';

import { AddDepartmentDialog } from './add-department-dialog';

describe('AddDepartmentDialog', () => {
  let service: AddDepartmentDialog;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AddDepartmentDialog);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
