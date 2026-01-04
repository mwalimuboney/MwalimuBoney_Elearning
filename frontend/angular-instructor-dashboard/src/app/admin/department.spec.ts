import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Department  } from './department';
describe('DepartmentService', () => {
  let service: Department;

  beforeEach(() => {
    TestBed.configureTestingModule({ });
    service = TestBed.inject(DepartmentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});