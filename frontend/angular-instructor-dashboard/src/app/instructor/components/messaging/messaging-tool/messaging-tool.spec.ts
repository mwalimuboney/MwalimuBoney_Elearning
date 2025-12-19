import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessagingToolComponent } from './messaging-tool';

describe('MessagingToolComponent', () => {
  let component: MessagingToolComponent;
  let fixture: ComponentFixture<MessagingToolComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessagingToolComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MessagingToolComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
