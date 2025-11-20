import type {TermsToHighlight} from '@coveo/headless';
import {describe, expect, it} from 'vitest';
import {TextParser} from './text-parser';

describe('TextParser', () => {
  function createElement(tagName: string, innerText: string = ''): HTMLElement {
    const element = document.createElement(tagName);
    element.innerText = innerText;
    return element;
  }

  it('should return inner text for non-tagged elements (trimmed)', () => {
    const parser = new TextParser({} as TermsToHighlight);
    const el = createElement('div', '  Cat  ');

    expect(parser.parse(el)).toBe('Cat');
  });

  it('should resolve exact original term (case-insensitive)', () => {
    const parser = new TextParser({Hello: []} as TermsToHighlight);
    const el = createElement('div', 'hello');

    expect(parser.parse(el)).toBe('Hello');
  });

  it('should resolve stemming expansion to the original term', () => {
    const parser = new TextParser({dogs: ['dog', 'doggy']} as TermsToHighlight);
    const el = createElement('div', 'DOG');

    expect(parser.parse(el)).toBe('dogs');
  });

  it('should use the first child inner text for tagged elements', () => {
    const parser = new TextParser({orig: ['x']} as TermsToHighlight);
    const tag = createElement('coveotaggedword');
    const span = createElement('span', 'x');
    tag.appendChild(span);

    expect(parser.parse(tag)).toBe('orig');
  });

  it('should return empty string when tagged element has no children', () => {
    const parser = new TextParser({} as TermsToHighlight);
    const tag = createElement('coveotaggedword');

    expect(parser.parse(tag)).toBe('');
  });
});
