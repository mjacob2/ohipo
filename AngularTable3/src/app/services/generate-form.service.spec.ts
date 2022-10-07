import { TestBed } from '@angular/core/testing';

import { GenerateFormService } from './generate-form.service';

describe('GenerateFormService', () => {
  let service: GenerateFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GenerateFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
