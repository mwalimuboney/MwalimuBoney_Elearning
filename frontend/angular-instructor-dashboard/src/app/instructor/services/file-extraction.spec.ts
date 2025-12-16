import { TestBed } from '@angular/core/testing';

import { FileExtraction } from './file-extraction';

describe('FileExtraction', () => {
  let service: FileExtraction;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FileExtraction);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
