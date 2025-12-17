import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LessonEditorList } from './lesson-editor-list';

describe('LessonEditorList', () => {
  let component: LessonEditorList;
  let fixture: ComponentFixture<LessonEditorList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LessonEditorList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LessonEditorList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
