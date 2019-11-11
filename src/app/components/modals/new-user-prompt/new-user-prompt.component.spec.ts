import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewUserPromptComponent } from './new-user-prompt.component';

describe('NewUserPromptComponent', () => {
  let component: NewUserPromptComponent;
  let fixture: ComponentFixture<NewUserPromptComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewUserPromptComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewUserPromptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
