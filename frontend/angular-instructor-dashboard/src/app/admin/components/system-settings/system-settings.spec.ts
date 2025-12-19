import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SoundSettingsComponent } from './system-settings';

describe('SystemSettings', () => {
  let component: SoundSettingsComponent;
  let fixture: ComponentFixture<SoundSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SoundSettingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SoundSettingsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
