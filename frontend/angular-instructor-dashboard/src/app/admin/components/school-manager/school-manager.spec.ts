import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchoolManager } from './school-manager';

describe('SchoolManager', () => {
  let component: SchoolManager;
  let fixture: ComponentFixture<SchoolManager>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SchoolManager]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SchoolManager);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
