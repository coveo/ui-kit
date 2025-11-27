import {describe, expect, it} from 'vitest';
import {getQuestionPart} from './get-question-part';

describe('#getQuestionPart', () => {
  it('should return collapsed part when expanded is false', () => {
    expect(getQuestionPart('button', false)).toBe('question-button-collapsed');
    expect(getQuestionPart('text', false)).toBe('question-text-collapsed');
    expect(getQuestionPart('icon', false)).toBe('question-icon-collapsed');
  });

  it('should return expanded part when expanded is true', () => {
    expect(getQuestionPart('button', true)).toBe('question-button-expanded');
    expect(getQuestionPart('text', true)).toBe('question-text-expanded');
    expect(getQuestionPart('icon', true)).toBe('question-icon-expanded');
  });

  it('should handle various base values', () => {
    expect(getQuestionPart('custom', false)).toBe('question-custom-collapsed');
    expect(getQuestionPart('another', true)).toBe('question-another-expanded');
  });
});
