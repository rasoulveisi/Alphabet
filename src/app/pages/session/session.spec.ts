import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';
import { describe, expect, it, beforeEach } from 'vitest';
import { Session } from './session';
import { ProgressService } from '../../services/progress.service';

describe('Session', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Session],
      providers: [
        provideRouter([]),
        { provide: PLATFORM_ID, useValue: 'browser' },
        ProgressService,
      ],
    }).compileComponents();
  });

  it('creates', () => {
    const fixture = TestBed.createComponent(Session);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
