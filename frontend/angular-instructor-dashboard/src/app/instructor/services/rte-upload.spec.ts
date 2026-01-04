import { TestBed } from '@angular/core/testing';

import { RteUpload } from './rte-upload';

describe('RteUpload', () => {
  let service: RteUpload;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RteUpload);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
