import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GithubSuccessComponent } from './github-success.component';

describe('GithubSuccessComponent', () => {
  let component: GithubSuccessComponent;
  let fixture: ComponentFixture<GithubSuccessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GithubSuccessComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GithubSuccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
