import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AutoTableComponent } from './auto-table.component';

describe('AutoTableComponent', () => {
  let component: AutoTableComponent;
  let fixture: ComponentFixture<AutoTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AutoTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AutoTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
