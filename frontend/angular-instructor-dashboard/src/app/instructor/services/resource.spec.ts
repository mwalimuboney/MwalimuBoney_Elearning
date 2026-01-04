import { TestBed } from '@angular/core/testing';

import { ResourceService } from './resource';

describe('Resource', () => {
  let service: ResourceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ResourceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
