import {html} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {renderInAtomicInsightInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/insight/atomic-insight-interface-fixture';
import {buildFakeInsightEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/insight/engine';
import {mockConsole} from '@/vitest-utils/testing-helpers/testing-utils/mock-console';
import type {AtomicInsightResultChildren} from './atomic-insight-result-children';
import './atomic-insight-result-children';
import '@/src/components/insight/result-templates/atomic-insight-result-children-template/atomic-insight-result-children-template';

vi.mock('@coveo/headless/insight', {spy: true});

describe('atomic-insight-result-children', () => {
  const mockedEngine = buildFakeInsightEngine();

  beforeEach(() => {
    mockConsole();
  });

  interface RenderInsightResultChildrenOptions {
    inheritTemplates?: boolean;
    imageSize?: string;
    noResultText?: string;
    includeTemplate?: boolean;
  }

  const renderInsightResultChildren = async ({
    inheritTemplates = false,
    imageSize,
    noResultText = 'no-documents-related',
    includeTemplate = true,
  }: RenderInsightResultChildrenOptions = {}) => {
    const templateSlot = includeTemplate
      ? html`<atomic-insight-result-children-template>
          <template><div>Template</div></template>
        </atomic-insight-result-children-template>`
      : html``;

    const {element} =
      await renderInAtomicInsightInterface<AtomicInsightResultChildren>({
        template: html`<atomic-insight-result-children
          ?inherit-templates=${inheritTemplates}
          image-size=${imageSize ?? ''}
          no-result-text=${noResultText}
        >
          ${templateSlot}
        </atomic-insight-result-children>`,
        selector: 'atomic-insight-result-children',
        bindings: (bindings) => {
          bindings.engine = mockedEngine;
          return bindings;
        },
      });

    return {
      element,
    };
  };

  describe('properties', () => {
    it('should have default inheritTemplates as false', async () => {
      const {element} = await renderInsightResultChildren();
      expect(element.inheritTemplates).toBe(false);
    });

    it('should have default noResultText', async () => {
      const {element} = await renderInsightResultChildren();
      expect(element.noResultText).toBe('no-documents-related');
    });

    it('should accept inherit-templates attribute', async () => {
      const {element} = await renderInsightResultChildren({
        inheritTemplates: true,
      });
      expect(element.inheritTemplates).toBe(true);
    });

    it('should accept image-size attribute', async () => {
      const {element} = await renderInsightResultChildren({imageSize: 'large'});
      expect(element.imageSize).toBe('large');
    });

    it('should accept no-result-text attribute', async () => {
      const {element} = await renderInsightResultChildren({
        noResultText: 'custom-no-results',
      });
      expect(element.noResultText).toBe('custom-no-results');
    });
  });

  it('should set an error when no child template is provided', async () => {
    const {element} = await renderInsightResultChildren({
      includeTemplate: false,
    });

    await element.updateComplete;
    expect(element.error).toBeDefined();
    expect(element.error.message).toContain(
      'requires at least one "atomic-insight-result-children-template" component'
    );
  });

  describe('#resolveChildTemplates event', () => {
    it('should handle atomic/resolveChildTemplates event and prevent default', async () => {
      const {element} = await renderInsightResultChildren();

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
      const {element} = await renderInsightResultChildren();

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
      const {element} = await renderInsightResultChildren({
        inheritTemplates: true,
        includeTemplate: false,
      });

      await element.updateComplete;
      // When inheritTemplates is true, no error for missing templates
      // But since there's no parent atomic-insight-result, there may be a context error
      // The key thing is there's no error about missing templates
      if (element.error) {
        expect(element.error.message).not.toContain(
          'requires at least one "atomic-insight-result-children-template"'
        );
      }
    });

    it('should use template provider from parent context when inheritTemplates is true', async () => {
      const {element} = await renderInsightResultChildren({
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
      const {element} = await renderInsightResultChildren();

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
      const {element} = await renderInsightResultChildren();

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
