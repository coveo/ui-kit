import {beforeEach, describe, expect, it, type MockInstance, vi} from 'vitest';
import type {LightDOMWithSlots} from '@/src/mixins/slots-for-no-shadow-dom-mixin';
import {getDefaultSlotFromHost, getNamedSlotFromHost} from './slot-utils';

class MockLightDOMElement extends HTMLElement implements LightDOMWithSlots {
  slotContent: {[name: string]: ChildNode[] | undefined} = {};

  renderDefaultSlotContent(defaultContent?: unknown) {
    return defaultContent ? [defaultContent] : [];
  }
}
customElements.define('mock-light-dom-element', MockLightDOMElement);

let consoleWarnSpy: MockInstance;

beforeEach(() => {
  consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
});

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

      const result = getNamedSlotFromHost(host, 'test-slot');

      expect(result).toBe(element);
    });

    it('should return undefined when slot does not exist', () => {
      host.slotContent = {
        'other-slot': [document.createElement('div')],
      };

      const result = getNamedSlotFromHost(host, 'test-slot');

      expect(result).toBeUndefined();
    });

    it('should return undefined when slot exists but is empty', () => {
      host.slotContent = {
        'test-slot': [],
      };

      const result = getNamedSlotFromHost(host, 'test-slot');

      expect(result).toBeUndefined();
    });

    it('should return undefined when slot exists but contains no Elements', () => {
      const textNode = document.createTextNode('text');
      const comment = document.createComment('comment');

      host.slotContent = {
        'test-slot': [textNode, comment],
      };

      const result = getNamedSlotFromHost(host, 'test-slot');

      expect(result).toBeUndefined();
    });

    it('should return first Element when multiple Elements exist', () => {
      const element1 = document.createElement('div');
      const element2 = document.createElement('span');

      host.slotContent = {
        'test-slot': [element1, element2],
      };

      const result = getNamedSlotFromHost(host, 'test-slot');

      expect(result).toBe(element1);
    });

    it('should handle null slotContent gracefully', () => {
      host.slotContent = {
        'test-slot': undefined,
      };

      const result = getNamedSlotFromHost(host, 'test-slot');

      expect(result).toBeUndefined();
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

      const result = getNamedSlotFromHost(host, 'test-slot');

      expect(result).toBe(childElement);
    });

    it('should return undefined when no children have matching slot attribute', () => {
      const childElement = document.createElement('span');
      childElement.setAttribute('slot', 'other-slot');
      host.appendChild(childElement);

      const result = getNamedSlotFromHost(host, 'test-slot');

      expect(result).toBeUndefined();
    });

    it('should return undefined when no children exist', () => {
      const result = getNamedSlotFromHost(host, 'test-slot');

      expect(result).toBeUndefined();
    });

    it('should return first element when multiple elements have same slot attribute', () => {
      const element1 = document.createElement('div');
      const element2 = document.createElement('span');
      element1.setAttribute('slot', 'test-slot');
      element2.setAttribute('slot', 'test-slot');
      host.appendChild(element1);
      host.appendChild(element2);

      const result = getNamedSlotFromHost(host, 'test-slot');

      expect(result).toBe(element1);
    });

    it('should warn when multiple elements have same slot attribute', () => {
      const element1 = document.createElement('div');
      const element2 = document.createElement('span');
      element1.setAttribute('slot', 'test-slot');
      element2.setAttribute('slot', 'test-slot');
      host.appendChild(element1);
      host.appendChild(element2);

      getNamedSlotFromHost(host, 'test-slot');

      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Element should only have 1 slot named "test-slot".',
        host
      );
    });

    it('should ignore children without slot attribute when looking for named slot', () => {
      const unslottedElement = document.createElement('div');
      const slottedElement = document.createElement('span');
      slottedElement.setAttribute('slot', 'test-slot');
      host.appendChild(unslottedElement);
      host.appendChild(slottedElement);

      const result = getNamedSlotFromHost(host, 'test-slot');

      expect(result).toBe(slottedElement);
    });
  });
});

describe('#getDefaultSlotFromHost', () => {
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

    const result = getDefaultSlotFromHost(host);

    expect(result).toBe(defaultChild);
  });

  it('should return child element with empty slot attribute', () => {
    const defaultChild = document.createElement('div');
    defaultChild.setAttribute('slot', '');
    host.appendChild(defaultChild);

    const result = getDefaultSlotFromHost(host);

    expect(result).toBe(defaultChild);
  });

  it('should return undefined when no default slot children exist', () => {
    const namedChild = document.createElement('span');
    namedChild.setAttribute('slot', 'named-slot');
    host.appendChild(namedChild);

    const result = getDefaultSlotFromHost(host);

    expect(result).toBeUndefined();
  });

  it('should return undefined when no children exist', () => {
    const result = getDefaultSlotFromHost(host);

    expect(result).toBeUndefined();
  });

  it('should return first element when multiple default slot elements exist', () => {
    const element1 = document.createElement('div');
    const element2 = document.createElement('span');
    host.appendChild(element1);
    host.appendChild(element2);

    const result = getDefaultSlotFromHost(host);

    expect(result).toBe(element1);
  });

  it('should warn when multiple default slot elements exist', () => {
    const element1 = document.createElement('div');
    const element2 = document.createElement('span');
    host.appendChild(element1);
    host.appendChild(element2);

    getDefaultSlotFromHost(host);

    expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Element should only have 1 default slot.',
      host
    );
  });
});
