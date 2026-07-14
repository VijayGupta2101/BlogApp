import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdatePage } from './update-page';

describe('UpdatePage', () => {
  let component: UpdatePage;
  let fixture: ComponentFixture<UpdatePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdatePage],
    }).compileComponents();

    fixture = TestBed.createComponent(UpdatePage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
