import {describe, expect, it} from 'vitest';
import type {AtomicFocusTrap} from './atomic-focus-trap';
import './atomic-focus-trap';

describe('atomic-focus-trap', () => {
  it('should be defined', () => {
    const element = document.createElement(
      'atomic-focus-trap'
    ) as AtomicFocusTrap;
    expect(element).toBeDefined();
  });
});
