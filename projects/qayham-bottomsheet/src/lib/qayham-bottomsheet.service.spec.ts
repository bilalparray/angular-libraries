import { TestBed } from '@angular/core/testing';

import { QayhamBottomsheetService } from './qayham-bottomsheet.service';

describe('QayhamBottomsheetService', () => {
  let service: QayhamBottomsheetService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QayhamBottomsheetService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
