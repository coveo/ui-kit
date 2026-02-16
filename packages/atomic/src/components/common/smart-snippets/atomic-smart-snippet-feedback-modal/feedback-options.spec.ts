import {describe, expect, it} from 'vitest';
import {feedbackOptions} from './feedback-options';

describe('#feedbackOptions', () => {
  it('should export feedback options array', () => {
    expect(feedbackOptions).toBeDefined();
    expect(Array.isArray(feedbackOptions)).toBe(true);
  });

  it('should contain 4 feedback options', () => {
    expect(feedbackOptions).toHaveLength(4);
  });

  it('should have correct structure for each option', () => {
    feedbackOptions.forEach((option) => {
      expect(option).toHaveProperty('id');
      expect(option).toHaveProperty('localeKey');
      expect(option).toHaveProperty('correspondingAnswer');
      expect(typeof option.id).toBe('string');
      expect(typeof option.localeKey).toBe('string');
    });
  });

  it('should include "does_not_answer" option', () => {
    const option = feedbackOptions.find(
      (opt) => opt.correspondingAnswer === 'does_not_answer'
    );

    expect(option).toBeDefined();
    expect(option?.id).toBe('does-not-answer');
    expect(option?.localeKey).toBe(
      'smart-snippet-feedback-reason-does-not-answer'
    );
  });

  it('should include "partially_answers" option', () => {
    const option = feedbackOptions.find(
      (opt) => opt.correspondingAnswer === 'partially_answers'
    );

    expect(option).toBeDefined();
    expect(option?.id).toBe('partially-answers');
    expect(option?.localeKey).toBe(
      'smart-snippet-feedback-reason-partially-answers'
    );
  });

  it('should include "was_not_a_question" option', () => {
    const option = feedbackOptions.find(
      (opt) => opt.correspondingAnswer === 'was_not_a_question'
    );

    expect(option).toBeDefined();
    expect(option?.id).toBe('was-not-a-question');
    expect(option?.localeKey).toBe(
      'smart-snippet-feedback-reason-was-not-a-question'
    );
  });

  it('should include "other" option', () => {
    const option = feedbackOptions.find(
      (opt) => opt.correspondingAnswer === 'other'
    );

    expect(option).toBeDefined();
    expect(option?.id).toBe('other');
    expect(option?.localeKey).toBe('smart-snippet-feedback-reason-other');
  });
});
