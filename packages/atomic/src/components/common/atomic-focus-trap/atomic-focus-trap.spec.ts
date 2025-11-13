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
    const wrapper = await renderFunctionFixture(
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

    const element = wrapper.querySelector(
      'atomic-focus-trap'
    ) as AtomicFocusTrap;
    await element.updateComplete;

    return element;
  };

  describe('when rendered', () => {
    it('should have default property values', async () => {
      const element = await renderFocusTrap();
      expect(element.active).toBe(false);
      expect(element.shouldHideSelf).toBe(true);
      expect(element.scope).toBe(document.body);
    });

    it('should accept custom property values', async () => {
      const customScope = document.createElement('div');
      const customSource = document.createElement('button');
      const element = await renderFocusTrap({
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

    it('should not be hidden initially when active is false', async () => {
      const element = await renderFocusTrap({
        active: false,
        shouldHideSelf: true,
      });

      // On initial render with active=false, the element is not yet hidden
      // It only gets hidden when transitioning from active=true to active=false
      expect(element.hasAttribute('aria-hidden')).toBe(false);
    });

    it('should not hide itself when shouldHideSelf is false', async () => {
      const element = await renderFocusTrap({
        active: false,
        shouldHideSelf: false,
      });

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

      const element = await renderFocusTrap({active: false});
      container.appendChild(element);

      element.active = true;

      await vi.waitFor(() => {
        expect(sibling.hasAttribute('aria-hidden')).toBe(true);
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

      const element = await renderFocusTrap({active: false});
      container.appendChild(element);

      element.active = true;

      expect(ariaLiveElement.hasAttribute('aria-hidden')).toBe(false);

      document.body.removeChild(container);
    });

    it('should not hide atomic-aria-live elements', async () => {
      const container = document.createElement('div');
      document.body.appendChild(container);

      const ariaLiveElement = document.createElement('atomic-aria-live');
      container.appendChild(ariaLiveElement);

      const element = await renderFocusTrap({active: false});
      container.appendChild(element);

      element.active = true;

      expect(ariaLiveElement.hasAttribute('aria-hidden')).toBe(false);

      document.body.removeChild(container);
    });

    it('should show itself', async () => {
      const element = await renderFocusTrap({
        active: false,
        shouldHideSelf: true,
      });

      element.active = true;

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

      const element = await renderFocusTrap({active: false});
      container.appendChild(element);

      element.active = true;

      await vi.waitFor(() => {
        expect(sibling.hasAttribute('aria-hidden')).toBe(true);
      });

      element.active = false;

      await vi.waitFor(() => {
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

      const element = await renderFocusTrap({
        active: true,
        source: sourceElement,
      });

      const focusSpy = vi.spyOn(sourceElement, 'focus');

      element.active = false;

      await vi.waitFor(() => {
        expect(focusSpy).toHaveBeenCalled();
      });

      document.body.removeChild(container);
    });

    it('should hide itself again when shouldHideSelf is true', async () => {
      const element = await renderFocusTrap({
        active: true,
        shouldHideSelf: true,
      });

      element.active = false;

      await vi.waitFor(() => {
        expect(element.hasAttribute('aria-hidden')).toBe(true);
        expect(element.getAttribute('tabindex')).toBe('-1');
      });
    });
  });

  describe('when added to the DOM (#connectedCallback)', () => {
    it('should add focusin event listener', async () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
      await renderFocusTrap();

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'focusin',
        expect.any(Function)
      );
    });
  });

  describe('when removed from the DOM (#disconnectedCallback)', () => {
    it('should remove focusin event listener', async () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
      const element = await renderFocusTrap();

      element.remove();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'focusin',
        expect.any(Function)
      );
    });
  });

  describe('when using a custom container', () => {
    it('should not hide the custom container on initial render when inactive', async () => {
      const container = document.createElement('div');
      document.body.appendChild(container);

      const customContainer = document.createElement('div');
      customContainer.textContent = 'Custom Container';
      container.appendChild(customContainer);

      const element = await renderFocusTrap({
        active: false,
        shouldHideSelf: true,
        container: customContainer,
      });

      // On initial render, custom container is not hidden
      // It only gets hidden when transitioning from active=true to active=false
      expect(customContainer.hasAttribute('aria-hidden')).toBe(false);
      expect(element.hasAttribute('aria-hidden')).toBe(false);

      document.body.removeChild(container);
    });
  });

  describe('when using a custom scope', () => {
    it('should only hide siblings within the custom scope', async () => {
      const container = document.createElement('div');
      document.body.appendChild(container);

      const customScope = document.createElement('div');
      const siblingInScope = document.createElement('div');
      const siblingOutOfScope = document.createElement('div');

      customScope.appendChild(siblingInScope);
      container.appendChild(customScope);
      container.appendChild(siblingOutOfScope);

      const element = await renderFocusTrap({
        active: false,
        scope: customScope,
      });
      customScope.appendChild(element);

      element.active = true;

      await vi.waitFor(() => {
        expect(siblingInScope.hasAttribute('aria-hidden')).toBe(true);
      });

      expect(siblingOutOfScope.hasAttribute('aria-hidden')).toBe(false);

      document.body.removeChild(container);
    });
  });
});
