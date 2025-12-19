import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentGradingReviewComponent } from './student-grading-review';

describe('StudentGradingReviewComponent', () => {
  let component: StudentGradingReviewComponent;
  let fixture: ComponentFixture<StudentGradingReviewComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentGradingReviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentGradingReviewComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
