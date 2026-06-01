import {
  AriaLiveRegion,
  isFocusable,
  getFirstFocusableElement,
  getLastFocusableElement,
  isCustomElement,
  isParentOf,
} from '../accessibilityUtils';

describe('accessibilityUtils', () => {
  describe('AriaLiveRegion', () => {
    let elem;

    beforeEach(() => {
      elem = {dispatchEvent: jest.fn()};
    });

    it('should dispatch a register region event on creation', () => {
      AriaLiveRegion('test-region', elem);
      expect(elem.dispatchEvent).toHaveBeenCalledTimes(1);
      const event = elem.dispatchEvent.mock.calls[0][0];
      expect(event.type).toBe('quantic__registerregion');
      expect(event.detail).toEqual({
        regionName: 'test-region',
        assertive: false,
      });
    });

    it('should dispatch a register region event with assertive flag', () => {
      AriaLiveRegion('test-region', elem, true);
      const event = elem.dispatchEvent.mock.calls[0][0];
      expect(event.detail.assertive).toBe(true);
    });

    it('should dispatch an aria live message event when dispatchMessage is called', () => {
      const region = AriaLiveRegion('test-region', elem);
      region.dispatchMessage('hello');
      expect(elem.dispatchEvent).toHaveBeenCalledTimes(2);
      const event = elem.dispatchEvent.mock.calls[1][0];
      expect(event.type).toBe('quantic__arialivemessage');
      expect(event.detail).toEqual({
        regionName: 'test-region',
        assertive: false,
        message: 'hello',
      });
    });
  });

  describe('isFocusable', () => {
    function createElement(tag, attrs = {}) {
      const el = document.createElement(tag);
      Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
      return el;
    }

    it('should return true for a button', () => {
      expect(isFocusable(createElement('button'))).toBe(true);
    });

    it('should return false for a disabled button', () => {
      expect(isFocusable(createElement('button', {disabled: ''}))).toBe(false);
    });

    it('should return true for an anchor with href', () => {
      expect(isFocusable(createElement('a', {href: '#'}))).toBe(true);
    });

    it('should return false for an anchor without href', () => {
      expect(isFocusable(createElement('a'))).toBe(false);
    });

    it('should return true for an input', () => {
      expect(isFocusable(createElement('input'))).toBe(true);
    });

    it('should return false for a disabled input', () => {
      expect(isFocusable(createElement('input', {disabled: ''}))).toBe(false);
    });

    it('should return true for an element with tabindex >= 0', () => {
      expect(isFocusable(createElement('div', {tabindex: '0'}))).toBe(true);
    });

    it('should return false for an element with tabindex -1', () => {
      expect(isFocusable(createElement('div', {tabindex: '-1'}))).toBe(false);
    });

    it('should return true for a contentEditable element', () => {
      expect(isFocusable(createElement('div', {contentEditable: 'true'}))).toBe(
        true
      );
    });

    it('should return false for a plain div', () => {
      expect(isFocusable(createElement('div'))).toBe(false);
    });

    it('should return true for an iframe', () => {
      expect(isFocusable(createElement('iframe'))).toBe(true);
    });

    it('should return true for a select', () => {
      expect(isFocusable(createElement('select'))).toBe(true);
    });

    it('should return true for a textarea', () => {
      expect(isFocusable(createElement('textarea'))).toBe(true);
    });
  });

  describe('isCustomElement', () => {
    it('should return true for elements with a hyphen in the tag name', () => {
      const el = document.createElement('my-component');
      expect(isCustomElement(el)).toBe(true);
    });

    it('should return false for standard elements', () => {
      const el = document.createElement('div');
      expect(isCustomElement(el)).toBe(false);
    });

    it('should return false for null', () => {
      expect(isCustomElement(null)).toBe(false);
    });
  });

  describe('getFirstFocusableElement', () => {
    it('should return null for null input', () => {
      expect(getFirstFocusableElement(null)).toBeNull();
    });

    it('should return the element itself if it is focusable and has no focusable children', () => {
      const btn = document.createElement('button');
      expect(getFirstFocusableElement(btn)).toBe(btn);
    });

    it('should return the first focusable child', () => {
      const div = document.createElement('div');
      const span = document.createElement('span');
      const btn1 = document.createElement('button');
      const btn2 = document.createElement('button');
      div.appendChild(span);
      div.appendChild(btn1);
      div.appendChild(btn2);
      expect(getFirstFocusableElement(div)).toBe(btn1);
    });

    it('should return null for a custom element without data-focusable', () => {
      const el = document.createElement('my-component');
      expect(getFirstFocusableElement(el)).toBeNull();
    });

    it('should return the custom element if data-focusable is true', () => {
      const el = document.createElement('my-component');
      el.dataset.focusable = 'true';
      expect(getFirstFocusableElement(el)).toBe(el);
    });

    it('should return null for a text node', () => {
      const text = document.createTextNode('hello');
      expect(getFirstFocusableElement(text)).toBeNull();
    });
  });

  describe('getLastFocusableElement', () => {
    it('should return null for null input', () => {
      expect(getLastFocusableElement(null)).toBeNull();
    });

    it('should return the last focusable child', () => {
      const div = document.createElement('div');
      const btn1 = document.createElement('button');
      const btn2 = document.createElement('button');
      div.appendChild(btn1);
      div.appendChild(btn2);
      expect(getLastFocusableElement(div)).toBe(btn2);
    });

    it('should return the element itself if it is focusable and has no focusable children', () => {
      const input = document.createElement('input');
      expect(getLastFocusableElement(input)).toBe(input);
    });
  });

  describe('isParentOf', () => {
    it('should return false for null', () => {
      expect(isParentOf(null, 'MY-COMPONENT')).toBe(false);
    });

    it('should return true if the element itself matches the target tag', () => {
      const el = document.createElement('my-component');
      expect(isParentOf(el, 'MY-COMPONENT')).toBe(true);
    });

    it('should return true if a descendant matches the target tag', () => {
      const wrapper = document.createElement('div');
      const child = document.createElement('my-component');
      wrapper.appendChild(child);
      expect(isParentOf(wrapper, 'MY-COMPONENT')).toBe(true);
    });

    it('should return false if no descendant matches', () => {
      const wrapper = document.createElement('div');
      const child = document.createElement('span');
      wrapper.appendChild(child);
      expect(isParentOf(wrapper, 'MY-COMPONENT')).toBe(false);
    });

    it('should return false for a text node', () => {
      const text = document.createTextNode('hello');
      expect(isParentOf(text, 'MY-COMPONENT')).toBe(false);
    });
  });
});
