import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PositionDialog } from './position-dialog';

describe('PositionDialog', () => {
  let component: PositionDialog;
  let fixture: ComponentFixture<PositionDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PositionDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PositionDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
