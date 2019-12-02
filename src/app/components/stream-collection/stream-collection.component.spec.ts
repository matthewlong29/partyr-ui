import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StreamCollectionComponent } from './stream-collection.component';

describe('StreamCollectionComponent', () => {
  let component: StreamCollectionComponent;
  let fixture: ComponentFixture<StreamCollectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StreamCollectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StreamCollectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
