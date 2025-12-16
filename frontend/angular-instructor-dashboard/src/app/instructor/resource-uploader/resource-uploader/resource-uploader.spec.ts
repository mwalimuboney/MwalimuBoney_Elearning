import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResourceUploader } from './resource-uploader';

describe('ResourceUploader', () => {
  let component: ResourceUploader;
  let fixture: ComponentFixture<ResourceUploader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResourceUploader]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResourceUploader);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
