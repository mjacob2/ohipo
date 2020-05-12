import { TestBed } from '@angular/core/testing';

import { HttpOfertyService } from './http-oferty.service';

describe('HttpOfertyService', () => {
  let service: HttpOfertyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HttpOfertyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
