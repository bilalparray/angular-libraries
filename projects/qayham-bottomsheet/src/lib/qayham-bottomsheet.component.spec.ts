import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QayhamBottomsheetComponent } from './qayham-bottomsheet.component';

describe('QayhamBottomsheetComponent', () => {
  let component: QayhamBottomsheetComponent;
  let fixture: ComponentFixture<QayhamBottomsheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QayhamBottomsheetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QayhamBottomsheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
