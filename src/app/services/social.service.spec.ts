import { TestBed } from '@angular/core/testing';

import { SocialService } from './social.service';

describe('SocialService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SocialService = TestBed.get(SocialService);
    expect(service).toBeTruthy();
  });
});
