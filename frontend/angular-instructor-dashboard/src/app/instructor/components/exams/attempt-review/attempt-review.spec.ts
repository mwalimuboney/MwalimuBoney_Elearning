import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttemptReview } from './attempt-review';

describe('AttemptReview', () => {
  let component: AttemptReview;
  let fixture: ComponentFixture<AttemptReview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttemptReview]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttemptReview);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
