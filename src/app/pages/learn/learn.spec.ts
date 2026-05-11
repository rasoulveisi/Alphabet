import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it, beforeEach } from 'vitest';
import { Learn } from './learn';

describe('Learn', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Learn],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(Learn);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
