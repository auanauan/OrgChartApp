import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParentSelectorDialog } from './parent-selector-dialog';

describe('ParentSelectorDialog', () => {
  let component: ParentSelectorDialog;
  let fixture: ComponentFixture<ParentSelectorDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParentSelectorDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParentSelectorDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
