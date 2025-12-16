import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Gradebook } from './gradebook';

describe('Gradebook', () => {
  let component: Gradebook;
  let fixture: ComponentFixture<Gradebook>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Gradebook]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Gradebook);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
