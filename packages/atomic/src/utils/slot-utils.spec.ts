import {beforeEach, describe, expect, it} from 'vitest';
import type {LightDOMWithSlots} from '@/src/mixins/slots-for-no-shadow-dom-mixin';
import {getDefaultSlotContent, getNamedSlotContent} from './slot-utils';

class MockLightDOMElement extends HTMLElement implements LightDOMWithSlots {
  slotContent: {[name: string]: ChildNode[] | undefined} = {};

  renderDefaultSlotContent(defaultContent?: unknown) {
    return defaultContent ? [defaultContent] : [];
  }
}
customElements.define('mock-light-dom-element', MockLightDOMElement);

describe('#getNamedSlotFromHost', () => {
  describe('when host uses Light DOM with slotContent property', () => {
    let host: MockLightDOMElement;

    beforeEach(() => {
      host = new MockLightDOMElement();
    });

    it('should return first Element from slotContent when slot exists', () => {
      const element = document.createElement('div');
      const textNode = document.createTextNode('text');
      const comment = document.createComment('comment');

      host.slotContent = {
        'test-slot': [textNode, comment, element],
      };

      const result = getNamedSlotContent(host, 'test-slot');

      expect(result).toHaveLength(1);
      expect(result[0]).toBe(element);
    });

    it('should return empty array when slot does not exist', () => {
      host.slotContent = {
        'other-slot': [document.createElement('div')],
      };

      const result = getNamedSlotContent(host, 'test-slot');

      expect(result).toHaveLength(0);
    });

    it('should return empty array when slot exists but is empty', () => {
      host.slotContent = {
        'test-slot': [],
      };

      const result = getNamedSlotContent(host, 'test-slot');

      expect(result).toHaveLength(0);
    });

    it('should return empty array when slot exists but contains no Elements', () => {
      const textNode = document.createTextNode('text');
      const comment = document.createComment('comment');

      host.slotContent = {
        'test-slot': [textNode, comment],
      };

      const result = getNamedSlotContent(host, 'test-slot');

      expect(result).toHaveLength(0);
    });

    it('should return all Elements', () => {
      const element1 = document.createElement('div');
      const element2 = document.createElement('span');

      host.slotContent = {
        'test-slot': [element1, element2],
      };

      const result = getNamedSlotContent(host, 'test-slot');

      expect(result).toHaveLength(2);
    });

    it('should handle null slotContent gracefully', () => {
      host.slotContent = {
        'test-slot': undefined,
      };

      const result = getNamedSlotContent(host, 'test-slot');

      expect(result).toHaveLength(0);
    });
  });

  describe('when host uses Shadow DOM (fallback behavior)', () => {
    let host: HTMLElement;

    beforeEach(() => {
      host = document.createElement('div');
    });

    it('should return child element with matching slot attribute', () => {
      const childElement = document.createElement('span');
      childElement.setAttribute('slot', 'test-slot');
      host.appendChild(childElement);

      const result = getNamedSlotContent(host, 'test-slot');

      expect(result).toEqual([childElement]);
    });

    it('should return empty array when no children have matching slot attribute', () => {
      const childElement = document.createElement('span');
      childElement.setAttribute('slot', 'other-slot');
      host.appendChild(childElement);

      const result = getNamedSlotContent(host, 'test-slot');

      expect(result).toHaveLength(0);
    });

    it('should return empty array when no children exist', () => {
      const result = getNamedSlotContent(host, 'test-slot');

      expect(result).toHaveLength(0);
    });

    it('should return all elements that have same slot attribute', () => {
      const element1 = document.createElement('div');
      const element2 = document.createElement('span');
      element1.setAttribute('slot', 'test-slot');
      element2.setAttribute('slot', 'test-slot');
      host.appendChild(element1);
      host.appendChild(element2);

      const result = getNamedSlotContent(host, 'test-slot');

      expect(result).toEqual([element1, element2]);
    });

    it('should ignore children without slot attribute when looking for named slot', () => {
      const unslottedElement = document.createElement('div');
      const slottedElement = document.createElement('span');
      slottedElement.setAttribute('slot', 'test-slot');
      host.appendChild(unslottedElement);
      host.appendChild(slottedElement);

      const result = getNamedSlotContent(host, 'test-slot');

      expect(result).toEqual([slottedElement]);
    });
  });
});

describe('#getDefaultSlotContent', () => {
  let host: HTMLElement;

  beforeEach(() => {
    host = document.createElement('div');
  });

  it('should return child element without slot attribute', () => {
    const defaultChild = document.createElement('div');
    const namedChild = document.createElement('span');
    namedChild.setAttribute('slot', 'named-slot');

    host.appendChild(defaultChild);
    host.appendChild(namedChild);

    const result = getDefaultSlotContent(host);

    expect(result).toEqual([defaultChild]);
  });

  it('should return child element with empty slot attribute', () => {
    const defaultChild = document.createElement('div');
    defaultChild.setAttribute('slot', '');
    host.appendChild(defaultChild);

    const result = getDefaultSlotContent(host);

    expect(result).toEqual([defaultChild]);
  });

  it('should return undefined when no default slot children exist', () => {
    const namedChild = document.createElement('span');
    namedChild.setAttribute('slot', 'named-slot');
    host.appendChild(namedChild);

    const result = getDefaultSlotContent(host);

    expect(result).toHaveLength(0);
  });

  it('should return undefined when no children exist', () => {
    const result = getDefaultSlotContent(host);

    expect(result).toHaveLength(0);
  });

  it('should return all elements when multiple default slot elements exist', () => {
    const element1 = document.createElement('div');
    const element2 = document.createElement('span');
    host.appendChild(element1);
    host.appendChild(element2);

    const result = getDefaultSlotContent(host);

    expect(result).toEqual([element1, element2]);
  });
});
