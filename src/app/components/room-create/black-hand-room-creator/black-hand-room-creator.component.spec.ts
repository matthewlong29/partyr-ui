import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BlackHandRoomCreatorComponent } from './black-hand-room-creator.component';

describe('BlackHandRoomCreatorComponent', () => {
  let component: BlackHandRoomCreatorComponent;
  let fixture: ComponentFixture<BlackHandRoomCreatorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BlackHandRoomCreatorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlackHandRoomCreatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
