import {describe, expect, it} from 'vitest';
import {ExpectedError, isExpectedError} from './errors.js';

describe('isExpectedError', () => {
  it('is true for expected outcomes: ExpectedError and Ctrl-C (ExitPromptError)', () => {
    expect(isExpectedError(new ExpectedError('handled'))).toBe(true);
    const abort = new Error('User force closed the prompt');
    abort.name = 'ExitPromptError';
    expect(isExpectedError(abort)).toBe(true);
  });

  it('is false for ordinary errors and non-error values', () => {
    expect(isExpectedError(new Error('boom'))).toBe(false);
    expect(isExpectedError('boom')).toBe(false);
    expect(isExpectedError(undefined)).toBe(false);
  });
});
