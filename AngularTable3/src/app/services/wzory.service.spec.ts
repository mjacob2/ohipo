import { TestBed } from '@angular/core/testing';

import { WzoryService } from './wzory.service';

describe('WzoryService', () => {
  let service: WzoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WzoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
