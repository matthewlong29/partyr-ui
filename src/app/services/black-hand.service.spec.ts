import { TestBed } from '@angular/core/testing';

import { BlackHandService } from './black-hand.service';

describe('BlackHandService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BlackHandService = TestBed.get(BlackHandService);
    expect(service).toBeTruthy();
  });
});
