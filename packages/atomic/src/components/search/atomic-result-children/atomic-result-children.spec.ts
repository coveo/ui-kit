import {html} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-interface-fixture';
import {buildFakeSearchEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/search/engine';
import {mockConsole} from '@/vitest-utils/testing-helpers/testing-utils/mock-console';
import type {AtomicResultChildren} from './atomic-result-children';
import './atomic-result-children';
import '@/src/components/search/atomic-result-children-template/atomic-result-children-template';

vi.mock('@coveo/headless', {spy: true});

describe('atomic-result-children', () => {
  const mockedEngine = buildFakeSearchEngine();

  beforeEach(() => {
    mockConsole();
  });

  interface RenderResultChildrenOptions {
    inheritTemplates?: boolean;
    imageSize?: string;
    noResultText?: string;
    includeTemplate?: boolean;
  }

  const renderResultChildren = async ({
    inheritTemplates = false,
    imageSize,
    noResultText = 'no-documents-related',
    includeTemplate = true,
  }: RenderResultChildrenOptions = {}) => {
    const templateSlot = includeTemplate
      ? html`<atomic-result-children-template>
          <template><div>Template</div></template>
        </atomic-result-children-template>`
      : html``;

    const {element} = await renderInAtomicSearchInterface<AtomicResultChildren>(
      {
        template: html`<atomic-result-children
          ?inherit-templates=${inheritTemplates}
          image-size=${imageSize ?? ''}
          no-result-text=${noResultText}
        >
          ${templateSlot}
        </atomic-result-children>`,
        selector: 'atomic-result-children',
        bindings: (bindings) => {
          bindings.engine = mockedEngine;
          return bindings;
        },
      }
    );

    return {
      element,
    };
  };

  describe('properties', () => {
    it('should have default inheritTemplates as false', async () => {
      const {element} = await renderResultChildren();
      expect(element.inheritTemplates).toBe(false);
    });

    it('should have default noResultText', async () => {
      const {element} = await renderResultChildren();
      expect(element.noResultText).toBe('no-documents-related');
    });

    it('should accept inherit-templates attribute', async () => {
      const {element} = await renderResultChildren({inheritTemplates: true});
      expect(element.inheritTemplates).toBe(true);
    });

    it('should accept image-size attribute', async () => {
      const {element} = await renderResultChildren({imageSize: 'large'});
      expect(element.imageSize).toBe('large');
    });

    it('should accept no-result-text attribute', async () => {
      const {element} = await renderResultChildren({
        noResultText: 'custom-no-results',
      });
      expect(element.noResultText).toBe('custom-no-results');
    });
  });

  it('should set an error when no child template is provided', async () => {
    const {element} = await renderResultChildren({includeTemplate: false});

    await element.updateComplete;
    expect(element.error).toBeDefined();
    expect(element.error.message).toContain(
      'requires at least one "atomic-result-children-template" component'
    );
  });

  describe('#resolveChildTemplates event', () => {
    it('should handle atomic/resolveChildTemplates event and prevent default', async () => {
      const {element} = await renderResultChildren();

      const detailFn = vi.fn();
      const event = new CustomEvent('atomic/resolveChildTemplates', {
        detail: detailFn,
        bubbles: true,
        cancelable: true,
      });

      element.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(true);
    });

    it('should call the detail function with the template provider', async () => {
      const {element} = await renderResultChildren();

      const detailFn = vi.fn();
      const event = new CustomEvent('atomic/resolveChildTemplates', {
        detail: detailFn,
        bubbles: true,
        cancelable: true,
      });

      element.dispatchEvent(event);
      expect(detailFn).toHaveBeenCalled();
    });
  });

  describe('when inheritTemplates is true', () => {
    it('should not require child templates', async () => {
      const {element} = await renderResultChildren({
        inheritTemplates: true,
        includeTemplate: false,
      });

      await element.updateComplete;
      // When inheritTemplates is true, no error for missing templates
      // But since there's no parent atomic-result, there may be a context error
      // The key thing is there's no error about missing templates
      if (element.error) {
        expect(element.error.message).not.toContain(
          'requires at least one "atomic-result-children-template"'
        );
      }
    });

    it('should use template provider from parent context when inheritTemplates is true', async () => {
      const {element} = await renderResultChildren({
        inheritTemplates: true,
        includeTemplate: false,
      });

      const detailFn = vi.fn();
      const event = new CustomEvent('atomic/resolveChildTemplates', {
        detail: detailFn,
        bubbles: true,
        cancelable: true,
      });

      element.dispatchEvent(event);
      expect(detailFn).toHaveBeenCalled();
      // When inheritTemplates is true and no local template, it should resolve from parent context
      expect(event.defaultPrevented).toBe(true);
    });
  });

  describe('when connected to the DOM', () => {
    it('should handle atomic/resolveChildTemplates event', async () => {
      const {element} = await renderResultChildren();

      const detailFn = vi.fn();
      const event = new CustomEvent('atomic/resolveChildTemplates', {
        detail: detailFn,
        bubbles: true,
        cancelable: true,
      });

      element.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(true);
      expect(detailFn).toHaveBeenCalled();
    });
  });

  describe('when removed from the DOM', () => {
    it('should remove resolveChildTemplates listener', async () => {
      const {element} = await renderResultChildren();

      // Add a spy to track the event listener
      const addListenerSpy = vi.spyOn(element, 'addEventListener');
      const removeListenerSpy = vi.spyOn(element, 'removeEventListener');

      // Re-connect to verify listener is added
      element.connectedCallback();
      expect(addListenerSpy).toHaveBeenCalledWith(
        'atomic/resolveChildTemplates',
        expect.any(Function)
      );

      // Disconnect from DOM
      element.disconnectedCallback();

      // Verify listener is removed
      expect(removeListenerSpy).toHaveBeenCalledWith(
        'atomic/resolveChildTemplates',
        expect.any(Function)
      );

      addListenerSpy.mockRestore();
      removeListenerSpy.mockRestore();
    });
  });
});
