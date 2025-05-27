import {describe, it, expect} from 'vitest';
import {atomicElement} from './atomic-element';

describe('#atomicElement', () => {
  const tagName = 'test-element';
  class TestElement extends HTMLElement {}

  it('should define a custom element if not already defined', () => {
    atomicElement(tagName)(TestElement);
    expect(customElements.get(tagName)).toBe(TestElement);
  });

  it('should not redefine a custom element if already defined', () => {
    class SecondElement extends HTMLElement {}
    expect(customElements.get(tagName)).toBe(TestElement);

    atomicElement(tagName)(SecondElement);
    expect(customElements.get(tagName)).toBe(TestElement);
  });
});
