import { TestBed } from '@angular/core/testing';

import { Fr } from './fr';

describe('Fr', () => {
  let service: Fr;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Fr);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
