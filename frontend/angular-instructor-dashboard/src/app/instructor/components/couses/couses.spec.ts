import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Couses } from './couses';

describe('Couses', () => {
  let component: Couses;
  let fixture: ComponentFixture<Couses>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Couses]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Couses);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
