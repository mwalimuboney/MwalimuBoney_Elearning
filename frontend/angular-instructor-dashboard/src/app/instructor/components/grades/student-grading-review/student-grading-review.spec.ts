import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentGradingReview } from './student-grading-review';

describe('StudentGradingReview', () => {
  let component: StudentGradingReview;
  let fixture: ComponentFixture<StudentGradingReview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentGradingReview]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentGradingReview);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
