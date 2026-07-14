import { TestBed } from '@angular/core/testing';

import { BackendApi } from './backend-api';

describe('BackendApi', () => {
  let service: BackendApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BackendApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
