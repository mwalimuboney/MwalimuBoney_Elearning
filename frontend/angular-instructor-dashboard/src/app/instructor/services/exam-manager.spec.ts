import { TestBed } from '@angular/core/testing';

import { ExamManager } from './exam-manager';

describe('ExamManager', () => {
  let service: ExamManager;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExamManager);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
