import {describe, expect, it} from 'vitest';
import {ExpectedError, isExpectedError} from './errors.js';

describe('isExpectedError', () => {
  it('is true for an ExpectedError', () => {
    expect(isExpectedError(new ExpectedError('handled'))).toBe(true);
  });

  it('is true for an ExitPromptError (Ctrl-C during a prompt)', () => {
    const abort = new Error('User force closed the prompt');
    abort.name = 'ExitPromptError';
    expect(isExpectedError(abort)).toBe(true);
  });

  it('is false for an ordinary error or a non-error value', () => {
    expect(isExpectedError(new Error('boom'))).toBe(false);
    expect(isExpectedError('boom')).toBe(false);
    expect(isExpectedError(undefined)).toBe(false);
  });
});
