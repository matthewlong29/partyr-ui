import { TestBed } from '@angular/core/testing';

import { WebRtcService } from './web-rtc.service';

describe('WebRtcService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: WebRtcService = TestBed.get(WebRtcService);
    expect(service).toBeTruthy();
  });
});
