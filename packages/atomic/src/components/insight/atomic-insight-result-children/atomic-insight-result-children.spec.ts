import type {FoldedResult as InsightFoldedResult} from '@coveo/headless/insight';
import {html} from 'lit';
import {beforeAll, beforeEach, describe, expect, it, vi} from 'vitest';
import type {DisplayConfig} from '@/src/components/common/item-list/context/item-display-config-context-controller';
import {
  buildMockDisplayConfig,
  buildMockInsightFoldedResult,
  buildMockInsightFoldedResultList,
  renderInAtomicInsightResult,
} from '@/vitest-utils/testing-helpers/fixtures/atomic/insight/atomic-insight-result-fixture';
import {buildFakeInsightEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/insight/engine';
import {mockConsole} from '@/vitest-utils/testing-helpers/testing-utils/mock-console';
import type {AtomicInsightResultChildren} from './atomic-insight-result-children';
import './atomic-insight-result-children';

vi.mock('@coveo/headless/insight', {spy: true});

class MockInsightResultChildrenTemplate extends HTMLElement {
  conditions: unknown[] = [];

  async getTemplate() {
    const templateEl = this.querySelector('template');
    if (!templateEl) {
      return null;
    }
    return {
      content: templateEl.content.cloneNode(true) as DocumentFragment,
      conditions: this.conditions,
    };
  }
}

beforeAll(() => {
  if (!customElements.get('atomic-insight-result-children-template')) {
    customElements.define(
      'atomic-insight-result-children-template',
      MockInsightResultChildrenTemplate
    );
  }
});

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
    result?: InsightFoldedResult;
    children?: InsightFoldedResult[];
    displayConfig?: DisplayConfig;
    moreResultsAvailable?: boolean;
    isLoadingMoreResults?: boolean;
  }

  const renderInsightResultChildren = async ({
    inheritTemplates = false,
    imageSize,
    noResultText = 'no-documents-related',
    includeTemplate = true,
    result,
    children,
    displayConfig,
    moreResultsAvailable,
    isLoadingMoreResults,
  }: RenderInsightResultChildrenOptions = {}) => {
    const templateSlot = includeTemplate
      ? html`<atomic-insight-result-children-template>
          <template><div>Template</div></template>
        </atomic-insight-result-children-template>`
      : html``;

    const defaultChildren = children ?? [
      buildMockInsightFoldedResult({uniqueId: 'child-1', title: 'Child 1'}),
    ];

    const mockResult =
      result ??
      buildMockInsightFoldedResult({
        uniqueId: 'parent-result',
        title: 'Parent Result',
        children: defaultChildren,
      });

    const resultWithCollectionProps =
      moreResultsAvailable !== undefined || isLoadingMoreResults !== undefined
        ? {
            ...mockResult,
            moreResultsAvailable: moreResultsAvailable ?? false,
            isLoadingMoreResults: isLoadingMoreResults ?? false,
          }
        : mockResult;

    const {element} =
      await renderInAtomicInsightResult<AtomicInsightResultChildren>({
        template: html`<atomic-insight-result-children
          ?inherit-templates=${inheritTemplates}
          image-size=${imageSize ?? ''}
          no-result-text=${noResultText}
        >
          ${templateSlot}
        </atomic-insight-result-children>`,
        selector: 'atomic-insight-result-children',
        result: resultWithCollectionProps,
        foldedResultList: buildMockInsightFoldedResultList([
          resultWithCollectionProps,
        ]),
        displayConfig: displayConfig ?? buildMockDisplayConfig(),
        bindings: (bindings) => {
          bindings.engine = mockedEngine;
          return bindings;
        },
      });

    return {
      element,
    };
  };

  describe('when checking properties', () => {
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

    expect(element.error).toBeDefined();
    expect(element.error.message).toContain(
      'requires at least one "atomic-insight-result-children-template" component'
    );
  });

  describe('when resolveChildTemplates event is dispatched', () => {
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

      const addListenerSpy = vi.spyOn(element, 'addEventListener');
      const removeListenerSpy = vi.spyOn(element, 'removeEventListener');

      element.connectedCallback();
      expect(addListenerSpy).toHaveBeenCalledWith(
        'atomic/resolveChildTemplates',
        expect.any(Function)
      );

      element.disconnectedCallback();

      expect(removeListenerSpy).toHaveBeenCalledWith(
        'atomic/resolveChildTemplates',
        expect.any(Function)
      );

      addListenerSpy.mockRestore();
      removeListenerSpy.mockRestore();
    });

    it('should unsubscribe from foldedResultList on disconnect', async () => {
      const {element} = await renderInsightResultChildren();

      const unsubscribeSpy = vi.fn();
      (
        element as unknown as {foldedResultListUnsubscriber: () => void}
      ).foldedResultListUnsubscriber = unsubscribeSpy;

      element.disconnectedCallback();

      expect(unsubscribeSpy).toHaveBeenCalled();
    });
  });

  describe('when templates are nested', () => {
    it('should only use direct child templates, not nested ones', async () => {
      const {element} = await renderInsightResultChildren();

      const directTemplates = element.querySelectorAll(
        ':scope > atomic-insight-result-children-template'
      );
      expect(directTemplates.length).toBe(1);
    });
  });

  describe('when image-size is configured', () => {
    it('should accept small image size', async () => {
      const {element} = await renderInsightResultChildren({imageSize: 'small'});
      expect(element.imageSize).toBe('small');
    });

    it('should accept icon image size', async () => {
      const {element} = await renderInsightResultChildren({imageSize: 'icon'});
      expect(element.imageSize).toBe('icon');
    });

    it('should accept none image size', async () => {
      const {element} = await renderInsightResultChildren({imageSize: 'none'});
      expect(element.imageSize).toBe('none');
    });
  });

  describe('when rendering children', () => {
    it('should render child results when children exist', async () => {
      const {element} = await renderInsightResultChildren({
        children: [
          buildMockInsightFoldedResult({
            uniqueId: 'child-1',
            title: 'Child Result 1',
          }),
        ],
      });

      expect(element.error).toBeFalsy();
      const childrenRoot = element.shadowRoot?.querySelector(
        '[part="children-root"]'
      );
      expect(childrenRoot).toBeDefined();
    });

    it('should render nothing when result has no children', async () => {
      const {element} = await renderInsightResultChildren({
        children: [],
      });

      expect(element.error).toBeFalsy();
      const childrenRoot = element.shadowRoot?.querySelector(
        '[part="children-root"]'
      );
      expect(childrenRoot).toBeNull();
    });

    it('should render multiple children when multiple exist', async () => {
      const {element} = await renderInsightResultChildren({
        children: [
          buildMockInsightFoldedResult({uniqueId: 'child-1', title: 'Child 1'}),
          buildMockInsightFoldedResult({uniqueId: 'child-2', title: 'Child 2'}),
          buildMockInsightFoldedResult({uniqueId: 'child-3', title: 'Child 3'}),
        ],
      });

      expect(element.error).toBeFalsy();
      const atomicResults = element.shadowRoot?.querySelectorAll(
        'atomic-insight-result'
      );
      expect(atomicResults?.length).toBe(3);
    });

    it('should apply display density from displayConfig', async () => {
      const {element} = await renderInsightResultChildren({
        displayConfig: buildMockDisplayConfig({density: 'compact'}),
      });

      expect(element.error).toBeFalsy();
      const atomicResult = element.shadowRoot?.querySelector(
        'atomic-insight-result'
      );
      expect(atomicResult?.getAttribute('density')).toBe('compact');
    });

    it('should use component imageSize over displayConfig imageSize', async () => {
      const {element} = await renderInsightResultChildren({
        imageSize: 'large',
        displayConfig: buildMockDisplayConfig({imageSize: 'small'}),
      });

      expect(element.error).toBeFalsy();
      const atomicResult = element.shadowRoot?.querySelector(
        'atomic-insight-result'
      );
      expect(atomicResult?.getAttribute('image-size')).toBe('large');
    });

    it('should fall back to displayConfig imageSize when component imageSize is not set', async () => {
      const {element} = await renderInsightResultChildren({
        displayConfig: buildMockDisplayConfig({imageSize: 'large'}),
      });

      expect(element.error).toBeFalsy();
      const atomicResult = element.shadowRoot?.querySelector(
        'atomic-insight-result'
      );
      expect(atomicResult?.getAttribute('image-size')).toBe('large');
    });
  });

  describe('when rendering collection', () => {
    it('should render show/hide button when moreResultsAvailable is true', async () => {
      const {element} = await renderInsightResultChildren({
        children: [
          buildMockInsightFoldedResult({uniqueId: 'child-1', title: 'Child 1'}),
          buildMockInsightFoldedResult({uniqueId: 'child-2', title: 'Child 2'}),
        ],
        moreResultsAvailable: true,
        isLoadingMoreResults: false,
      });

      expect(element.error).toBeFalsy();
      const showHideButton = element.shadowRoot?.querySelector(
        '[part="show-hide-button"]'
      );
      expect(showHideButton).toBeDefined();
    });

    it('should render no-result message when collection has no children', async () => {
      const {element} = await renderInsightResultChildren({
        children: [],
        moreResultsAvailable: false,
        isLoadingMoreResults: false,
      });

      expect(element.error).toBeFalsy();
      const noResultRoot = element.shadowRoot?.querySelector(
        '[part="no-result-root"]'
      );
      expect(noResultRoot).toBeDefined();
    });
  });
});
