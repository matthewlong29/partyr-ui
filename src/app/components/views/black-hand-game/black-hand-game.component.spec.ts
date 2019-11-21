import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BlackHandGameComponent } from './black-hand-game.component';

describe('BlackHandGameComponent', () => {
  let component: BlackHandGameComponent;
  let fixture: ComponentFixture<BlackHandGameComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BlackHandGameComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlackHandGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
