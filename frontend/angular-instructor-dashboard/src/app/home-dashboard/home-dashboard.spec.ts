import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeDashboardComponent } from './home-dashboard';

describe('HomeDashboardComponent', () => {
  let component: HomeDashboardComponent;
  let fixture: ComponentFixture<HomeDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeDashboardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
