import { TestBed } from '@angular/core/testing';

import { OrgChart } from './org-chart';

describe('OrgChart', () => {
  let service: OrgChart;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrgChart);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
