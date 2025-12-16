import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessagingTool } from './messaging-tool';

describe('MessagingTool', () => {
  let component: MessagingTool;
  let fixture: ComponentFixture<MessagingTool>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessagingTool]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MessagingTool);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
