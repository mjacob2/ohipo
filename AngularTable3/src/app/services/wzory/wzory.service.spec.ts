import { TestBed } from '@angular/core/testing';

import { calculationFormulas } from './wzory.service';

describe('WzoryService', () => {
  let service: calculationFormulas;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(calculationFormulas);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
