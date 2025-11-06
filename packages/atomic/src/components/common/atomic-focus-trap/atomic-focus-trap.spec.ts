import {html} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import type {AtomicFocusTrap} from './atomic-focus-trap';
import './atomic-focus-trap';

describe('atomic-focus-trap', () => {
  const renderFocusTrap = async (
    options: {
      active?: boolean;
      source?: HTMLElement;
      container?: HTMLElement;
      shouldHideSelf?: boolean;
      scope?: Element;
      children?: string;
    } = {}
  ) => {
    const element = await renderFunctionFixture(
      html`<atomic-focus-trap
        .active=${options.active ?? false}
        .source=${options.source}
        .container=${options.container}
        .shouldHideSelf=${options.shouldHideSelf ?? true}
        .scope=${options.scope ?? document.body}
      >
        ${options.children ? html`${options.children}` : html`<button>Test Button</button>`}
      </atomic-focus-trap>`
    );

    const focusTrap = element.querySelector(
      'atomic-focus-trap'
    ) as AtomicFocusTrap;
    return {
      element: focusTrap,
      getButton: () => focusTrap.querySelector('button'),
    };
  };

  it('should be defined', () => {
    const element = document.createElement(
      'atomic-focus-trap'
    ) as AtomicFocusTrap;
    expect(element).toBeDefined();
  });

  describe('properties', () => {
    it('should have default property values', async () => {
      const {element} = await renderFocusTrap();
      expect(element.active).toBe(false);
      expect(element.shouldHideSelf).toBe(true);
      expect(element.scope).toBe(document.body);
    });

    it('should accept custom property values', async () => {
      const customScope = document.createElement('div');
      const customSource = document.createElement('button');
      const {element} = await renderFocusTrap({
        active: true,
        shouldHideSelf: false,
        scope: customScope,
        source: customSource,
      });

      expect(element.active).toBe(true);
      expect(element.shouldHideSelf).toBe(false);
      expect(element.scope).toBe(customScope);
      expect(element.source).toBe(customSource);
    });
  });

  describe('when active is false (initial state)', () => {
    it('should not hide siblings', async () => {
      const container = document.createElement('div');
      document.body.appendChild(container);

      const sibling = document.createElement('div');
      sibling.textContent = 'Sibling';
      container.appendChild(sibling);

      await renderFocusTrap({active: false});

      expect(sibling.hasAttribute('aria-hidden')).toBe(false);

      document.body.removeChild(container);
    });

    it('should hide itself when shouldHideSelf is true', async () => {
      const {element} = await renderFocusTrap({
        active: false,
        shouldHideSelf: true,
      });

      if ('inert' in HTMLElement.prototype) {
        expect((element as HTMLElement).inert).toBe(true);
      } else {
        expect(element.hasAttribute('aria-hidden')).toBe(true);
      }
      expect(element.getAttribute('tabindex')).toBe('-1');
    });

    it('should not hide itself when shouldHideSelf is false', async () => {
      const {element} = await renderFocusTrap({
        active: false,
        shouldHideSelf: false,
      });

      if ('inert' in HTMLElement.prototype) {
        expect((element as HTMLElement).inert).toBe(false);
      }
      expect(element.hasAttribute('aria-hidden')).toBe(false);
    });
  });

  describe('when active is set to true', () => {
    it('should hide sibling elements', async () => {
      const container = document.createElement('div');
      document.body.appendChild(container);

      const sibling = document.createElement('div');
      sibling.textContent = 'Sibling';
      container.appendChild(sibling);

      const {element} = await renderFocusTrap({active: false});
      container.appendChild(element);

      element.active = true;
      await element.updateComplete;

      await vi.waitFor(() => {
        if ('inert' in HTMLElement.prototype) {
          expect((sibling as HTMLElement).inert).toBe(true);
        } else {
          expect(sibling.hasAttribute('aria-hidden')).toBe(true);
        }
      });

      document.body.removeChild(container);
    });

    it('should not hide elements with aria-live attribute', async () => {
      const container = document.createElement('div');
      document.body.appendChild(container);

      const ariaLiveElement = document.createElement('div');
      ariaLiveElement.setAttribute('aria-live', 'polite');
      ariaLiveElement.textContent = 'Live Region';
      container.appendChild(ariaLiveElement);

      const {element} = await renderFocusTrap({active: false});
      container.appendChild(element);

      element.active = true;
      await element.updateComplete;

      expect(ariaLiveElement.hasAttribute('aria-hidden')).toBe(false);
      if ('inert' in HTMLElement.prototype) {
        expect((ariaLiveElement as HTMLElement).inert).toBe(false);
      }

      document.body.removeChild(container);
    });

    it('should not hide atomic-aria-live elements', async () => {
      const container = document.createElement('div');
      document.body.appendChild(container);

      const ariaLiveElement = document.createElement('atomic-aria-live');
      container.appendChild(ariaLiveElement);

      const {element} = await renderFocusTrap({active: false});
      container.appendChild(element);

      element.active = true;
      await element.updateComplete;

      expect(ariaLiveElement.hasAttribute('aria-hidden')).toBe(false);
      if ('inert' in HTMLElement.prototype) {
        expect((ariaLiveElement as HTMLElement).inert).toBe(false);
      }

      document.body.removeChild(container);
    });

    it('should show itself', async () => {
      const {element} = await renderFocusTrap({
        active: false,
        shouldHideSelf: true,
      });

      element.active = true;
      await element.updateComplete;

      if ('inert' in HTMLElement.prototype) {
        expect((element as HTMLElement).inert).toBe(false);
      }
      expect(element.hasAttribute('aria-hidden')).toBe(false);
      expect(element.hasAttribute('tabindex')).toBe(false);
    });
  });

  describe('when active is set to false after being true', () => {
    it('should restore hidden siblings', async () => {
      const container = document.createElement('div');
      document.body.appendChild(container);

      const sibling = document.createElement('div');
      sibling.textContent = 'Sibling';
      container.appendChild(sibling);

      const {element} = await renderFocusTrap({active: true});
      container.appendChild(element);

      await vi.waitFor(() => {
        if ('inert' in HTMLElement.prototype) {
          expect((sibling as HTMLElement).inert).toBe(true);
        } else {
          expect(sibling.hasAttribute('aria-hidden')).toBe(true);
        }
      });

      element.active = false;
      await element.updateComplete;

      await vi.waitFor(() => {
        if ('inert' in HTMLElement.prototype) {
          expect((sibling as HTMLElement).inert).toBe(false);
        }
        expect(sibling.hasAttribute('aria-hidden')).toBe(false);
      });

      document.body.removeChild(container);
    });

    it('should focus the source element if provided', async () => {
      const container = document.createElement('div');
      document.body.appendChild(container);

      const sourceElement = document.createElement('button');
      sourceElement.textContent = 'Source';
      container.appendChild(sourceElement);

      const {element} = await renderFocusTrap({
        active: true,
        source: sourceElement,
      });

      const focusSpy = vi.spyOn(sourceElement, 'focus');

      element.active = false;
      await element.updateComplete;

      await vi.waitFor(() => {
        expect(focusSpy).toHaveBeenCalled();
      });

      document.body.removeChild(container);
    });

    it('should hide itself again when shouldHideSelf is true', async () => {
      const {element} = await renderFocusTrap({
        active: true,
        shouldHideSelf: true,
      });

      element.active = false;
      await element.updateComplete;

      await vi.waitFor(() => {
        if ('inert' in HTMLElement.prototype) {
          expect((element as HTMLElement).inert).toBe(true);
        } else {
          expect(element.hasAttribute('aria-hidden')).toBe(true);
        }
        expect(element.getAttribute('tabindex')).toBe('-1');
      });
    });
  });

  describe('focus management', () => {
    it('should add focusin event listener on connect', async () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
      await renderFocusTrap();

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'focusin',
        expect.any(Function)
      );
    });

    it('should remove focusin event listener on disconnect', async () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
      const {element} = await renderFocusTrap();

      element.remove();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'focusin',
        expect.any(Function)
      );
    });
  });

  describe('custom container', () => {
    it('should hide the custom container instead of itself', async () => {
      const container = document.createElement('div');
      document.body.appendChild(container);

      const customContainer = document.createElement('div');
      customContainer.textContent = 'Custom Container';
      container.appendChild(customContainer);

      const {element} = await renderFocusTrap({
        active: false,
        shouldHideSelf: true,
        container: customContainer,
      });

      if ('inert' in HTMLElement.prototype) {
        expect((customContainer as HTMLElement).inert).toBe(true);
      } else {
        expect(customContainer.hasAttribute('aria-hidden')).toBe(true);
      }
      expect(customContainer.getAttribute('tabindex')).toBe('-1');

      expect(element.hasAttribute('aria-hidden')).toBe(false);

      document.body.removeChild(container);
    });
  });

  describe('custom scope', () => {
    it('should only hide siblings within the custom scope', async () => {
      const container = document.createElement('div');
      document.body.appendChild(container);

      const customScope = document.createElement('div');
      const siblingInScope = document.createElement('div');
      const siblingOutOfScope = document.createElement('div');

      customScope.appendChild(siblingInScope);
      container.appendChild(customScope);
      container.appendChild(siblingOutOfScope);

      const {element} = await renderFocusTrap({
        active: true,
        scope: customScope,
      });
      customScope.appendChild(element);

      await vi.waitFor(() => {
        if ('inert' in HTMLElement.prototype) {
          expect((siblingInScope as HTMLElement).inert).toBe(true);
        } else {
          expect(siblingInScope.hasAttribute('aria-hidden')).toBe(true);
        }
      });

      expect(siblingOutOfScope.hasAttribute('aria-hidden')).toBe(false);
      if ('inert' in HTMLElement.prototype) {
        expect((siblingOutOfScope as HTMLElement).inert).toBe(false);
      }

      document.body.removeChild(container);
    });
  });
});
