import {
  appendGeneratedAnswerText,
  hasDisplayableGeneratedAnswerText,
  resolveGeneratedAnswerTextIsEmpty,
} from './streamed-answer-text-utils.js';

describe('#hasDisplayableGeneratedAnswerText', () => {
  it('should return false when the answer is undefined', () => {
    expect(hasDisplayableGeneratedAnswerText(undefined)).toBe(false);
  });

  it('should return false when the answer is an empty string', () => {
    expect(hasDisplayableGeneratedAnswerText('')).toBe(false);
  });

  it('should return false when the answer only contains whitespace', () => {
    expect(hasDisplayableGeneratedAnswerText('   \n\t')).toBe(false);
  });

  it('should return true when the answer contains displayable text', () => {
    expect(hasDisplayableGeneratedAnswerText('Hello world')).toBe(true);
  });
});

describe('#appendGeneratedAnswerText', () => {
  it('should keep the answer undefined when the first chunk is blank-only', () => {
    expect(appendGeneratedAnswerText(undefined, '   ')).toBeUndefined();
  });

  it('should initialize the answer when the first chunk contains displayable text', () => {
    expect(appendGeneratedAnswerText(undefined, 'Hello')).toBe('Hello');
  });

  it('should preserve trailing whitespace when initializing the answer', () => {
    expect(appendGeneratedAnswerText(undefined, 'Hello ')).toBe('Hello ');
  });

  it('should initialize from the first non-blank chunk after blank prefixes', () => {
    const afterBlankPrefix = appendGeneratedAnswerText(undefined, '   ');

    expect(appendGeneratedAnswerText(afterBlankPrefix, 'Hello')).toBe('Hello');
  });

  it('should append later chunks when the answer already contains displayable text', () => {
    expect(appendGeneratedAnswerText('Hello', ' world')).toBe('Hello world');
  });

  it('should preserve whitespace between streamed chunks', () => {
    expect(appendGeneratedAnswerText('Hello ', 'world')).toBe('Hello world');
  });

  it('should append blank-only chunks after displayable text already exists', () => {
    expect(appendGeneratedAnswerText('Hello', '   ')).toBe('Hello   ');
  });
});

describe('#resolveGeneratedAnswerTextIsEmpty', () => {
  it('should return undefined when no answer was generated', () => {
    expect(resolveGeneratedAnswerTextIsEmpty(false, undefined)).toBeUndefined();
    expect(
      resolveGeneratedAnswerTextIsEmpty(false, 'answer', true)
    ).toBeUndefined();
  });

  it('should derive the value from answer text when no explicit value is provided', () => {
    expect(resolveGeneratedAnswerTextIsEmpty(true, undefined)).toBe(true);
    expect(resolveGeneratedAnswerTextIsEmpty(true, 'answer')).toBe(false);
  });

  it('should prefer an explicit answerTextIsEmpty value over the derived one', () => {
    expect(resolveGeneratedAnswerTextIsEmpty(true, 'answer', true)).toBe(true);
    expect(resolveGeneratedAnswerTextIsEmpty(true, undefined, false)).toBe(
      false
    );
  });
});
