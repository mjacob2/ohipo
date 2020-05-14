import { TestBed } from '@angular/core/testing';

import { InputErrorsService } from './input-errors.service';

describe('InputErrorsService', () => {
  let service: InputErrorsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InputErrorsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
