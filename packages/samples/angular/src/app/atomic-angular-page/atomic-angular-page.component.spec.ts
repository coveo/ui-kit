import {ComponentFixture, TestBed} from '@angular/core/testing';

import {AtomicAngularPageComponent} from './atomic-angular-page.component';

describe('AtomicAngularPageComponent', () => {
  let component: AtomicAngularPageComponent;
  let fixture: ComponentFixture<AtomicAngularPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AtomicAngularPageComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AtomicAngularPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
