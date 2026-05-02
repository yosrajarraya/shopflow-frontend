import { TestBed } from '@angular/core/testing';

import { Other } from './other';

describe('Other', () => {
  let service: Other;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Other);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
