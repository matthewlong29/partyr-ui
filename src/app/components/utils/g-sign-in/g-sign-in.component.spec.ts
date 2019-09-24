import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GSignInComponent } from './g-sign-in.component';

describe('GSignInComponent', () => {
  let component: GSignInComponent;
  let fixture: ComponentFixture<GSignInComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GSignInComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GSignInComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
