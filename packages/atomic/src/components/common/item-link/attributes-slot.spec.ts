import {beforeEach, describe, expect, it, type MockInstance, vi} from 'vitest';
import {getAttributesFromLinkSlotContent} from './attributes-slot';

describe('#getAttributesFromLinkSlotContent', () => {
  let host: HTMLElement;
  const slotName = 'attributes';

  const addSlotChild = (tag: string, attrs: Record<string, string> = {}) => {
    const el = document.createElement(tag);
    el.setAttribute('slot', slotName);
    for (const [key, value] of Object.entries(attrs)) {
      el.setAttribute(key, value);
    }
    host.appendChild(el);
    return el;
  };

  beforeEach(() => {
    host = document.createElement('div');
  });

  it('should return undefined when no slot content is found', () => {
    const result = getAttributesFromLinkSlotContent(host, slotName);
    expect(result).toBeUndefined();
  });

  it('should return attributes of anchor element', () => {
    addSlotChild('a', {'data-test': 'value', target: '_blank'});
    const result = getAttributesFromLinkSlotContent(host, slotName);
    const names = result?.map((a) => a.nodeName);
    expect(names).toContain('data-test');
    expect(names).toContain('target');
  });

  it('should filter out the "slot" attribute', () => {
    addSlotChild('a', {'data-test': 'value'});
    const result = getAttributesFromLinkSlotContent(host, slotName);
    const names = result?.map((a) => a.nodeName);
    expect(names).not.toContain('slot');
  });

  describe('when slot content is not an anchor element', () => {
    let warnSpy: MockInstance;

    beforeEach(() => {
      warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    it('should return undefined', () => {
      addSlotChild('span');
      const result = getAttributesFromLinkSlotContent(host, slotName);
      expect(result).toBeUndefined();
    });

    it('should warn about the invalid element', () => {
      addSlotChild('span');
      getAttributesFromLinkSlotContent(host, slotName);
      expect(warnSpy).toHaveBeenCalledWith(
        `Slot named "${slotName}" should be an "a" tag`,
        expect.any(HTMLElement)
      );
    });
  });

  describe('when the anchor element has an href attribute', () => {
    let warnSpy: MockInstance;

    beforeEach(() => {
      warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    it('should filter out the "href" attribute', () => {
      addSlotChild('a', {href: 'https://example.com', target: '_blank'});
      const result = getAttributesFromLinkSlotContent(host, slotName);
      expect(result?.map((a) => a.nodeName)).not.toContain('href');
    });

    it('should warn that href will be ignored', () => {
      addSlotChild('a', {href: 'https://example.com'});
      getAttributesFromLinkSlotContent(host, slotName);
      expect(warnSpy).toHaveBeenCalledWith(
        'The "href" attribute set on the "attributes" slot element will be ignored.'
      );
    });
  });

  describe('when multiple slot elements are found', () => {
    let warnSpy: MockInstance;

    beforeEach(() => {
      warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    it('should warn that only the first element will be used', () => {
      addSlotChild('a', {'data-first': 'true'});
      addSlotChild('a', {'data-second': 'true'});
      getAttributesFromLinkSlotContent(host, slotName);
      expect(warnSpy).toHaveBeenCalledWith(
        `More than one element found for slot "${slotName}", only the first one will be used.`,
        host
      );
    });

    it('should use only the first element', () => {
      addSlotChild('a', {'data-first': 'true'});
      addSlotChild('a', {'data-second': 'true'});
      const result = getAttributesFromLinkSlotContent(host, slotName);
      const names = result?.map((a) => a.nodeName);
      expect(names).toContain('data-first');
      expect(names).not.toContain('data-second');
    });
  });
});
