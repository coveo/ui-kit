import type {Result as InsightResult} from '@coveo/headless/insight';
import {html} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import type {ItemRenderingFunction} from '@/src/components/common/item-list/item-list-common';
import type {
  ItemDisplayDensity,
  ItemDisplayImageSize,
} from '@/src/components/common/layout/item-layout-utils';
import {renderInAtomicInsightInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/insight/atomic-insight-interface-fixture';
import {buildFakeInsightResult} from '@/vitest-utils/testing-helpers/fixtures/headless/insight/result';
import {AtomicInsightResult} from './atomic-insight-result';

vi.mock('@coveo/headless/insight', {spy: true});

const defaultTemplateContent = `
  <template>
    <atomic-result-text field="title"></atomic-result-text>
  </template>
`;

const renderTemplateContent = (templateHtml: string) => {
  const template = document.createElement('template');
  template.innerHTML = templateHtml;
  return template.content;
};

describe('atomic-insight-result', () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleWarnSpy?.mockRestore();
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  const renderResult = async (
    options: {
      result?: InsightResult;
      content?: ParentNode;
      density?: ItemDisplayDensity;
      imageSize?: ItemDisplayImageSize;
      loadingFlag?: string;
      renderingFunction?: ItemRenderingFunction;
    } = {}
  ) => {
    const {
      result = buildFakeInsightResult(),
      density = 'normal',
      imageSize = 'icon',
      loadingFlag = 'atomic-insight-result',
      renderingFunction,
    } = options;

    const content =
      'content' in options
        ? options.content
        : renderTemplateContent(defaultTemplateContent);
    const {element} = await renderInAtomicInsightInterface<AtomicInsightResult>(
      {
        template: html`<atomic-insight-result
          .result=${result}
          .content=${content}
          .density=${density}
          .imageSize=${imageSize}
          .stopPropagation=${true}
          .loadingFlag=${loadingFlag}
          .renderingFunction=${renderingFunction}
        ></atomic-insight-result>`,
        selector: 'atomic-insight-result',
        bindings: (bindings) => {
          bindings.store.onChange = vi.fn();
          bindings.store.state.resultList = {
            focusOnFirstResultAfterNextSearch: vi.fn(),
            focusOnNextNewResult: vi.fn(),
          };
          bindings.store.state.loadingFlags = [];
          return bindings;
        },
      }
    );
    return element;
  };

  it('should initialize', async () => {
    const element = await renderResult();
    expect(element).toBeInstanceOf(AtomicInsightResult);
  });

  it.each<{
    prop: 'density' | 'imageSize';
    invalidValue: string;
  }>([
    {
      prop: 'density',
      invalidValue: 'invalid',
    },
    {
      prop: 'imageSize',
      invalidValue: 'invalid',
    },
  ])(
    'should set error when #$prop is invalid',
    async ({prop, invalidValue}) => {
      const element = await renderResult();

      expect(element.error).toBeUndefined();

      // biome-ignore lint/suspicious/noExplicitAny: testing invalid values
      (element as any)[prop] = invalidValue;
      await element.updateComplete;

      expect(element.error).toBeDefined();
      expect(element.error.message).toMatch(new RegExp(prop, 'i'));
    }
  );

  it.each<{
    prop: 'density' | 'imageSize';
    validValue: ItemDisplayDensity | ItemDisplayImageSize;
    invalidValue: string;
  }>([
    {
      prop: 'density',
      validValue: 'normal',
      invalidValue: 'invalid',
    },
    {
      prop: 'imageSize',
      validValue: 'icon',
      invalidValue: 'invalid',
    },
  ])(
    'should set error when valid #$prop is updated to an invalid value',
    async ({prop, validValue, invalidValue}) => {
      const element = await renderResult({[prop]: validValue});

      expect(element.error).toBeUndefined();

      // biome-ignore lint/suspicious/noExplicitAny: testing invalid values
      (element as any)[prop] = invalidValue;
      await element.updateComplete;

      expect(element.error).toBeDefined();
      expect(element.error.message).toMatch(new RegExp(prop, 'i'));
    }
  );

  describe('rendering', () => {
    it('should render content HTML', async () => {
      const element = await renderResult();
      const contentHTML = element.shadowRoot
        ?.querySelector('.result-root')
        ?.innerHTML.trim();
      expect(contentHTML).toContain('atomic-result-text');
    });

    it('should warn when content is undefined', async () => {
      const element = await renderResult({content: undefined});
      await element.updateComplete;

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          'atomic-insight-result: content property is undefined'
        ),
        element
      );
    });

    it('should handle rendering function', async () => {
      const renderingFunction: ItemRenderingFunction = () => {
        return '<div class="custom-render">Custom</div>';
      };
      const element = await renderResult({renderingFunction});
      await element.updateComplete;

      const resultRoot = element.shadowRoot?.querySelector('.result-root');
      expect(resultRoot).toBeDefined();
    });

    it('should return empty div when layout is not created', async () => {
      const element = await renderResult({
        content: undefined,
        renderingFunction: undefined,
      });
      await element.updateComplete;

      const resultComponent =
        element.shadowRoot?.querySelector('.result-component');
      expect(resultComponent).toBeDefined();
      expect(resultComponent?.innerHTML.trim()).toBe('');
    });
  });

  describe('event listeners', () => {
    it('should resolve result on atomic/resolveResult event', async () => {
      const result = buildFakeInsightResult();
      const element = await renderResult({result});
      const mockCallback = vi.fn();

      const event = new CustomEvent('atomic/resolveResult', {
        detail: mockCallback,
        bubbles: true,
        cancelable: true,
      });

      element.dispatchEvent(event);

      expect(mockCallback).toHaveBeenCalledWith(result);
      expect(event.defaultPrevented).toBe(true);
    });

    it('should resolve interactive result on atomic/resolveInteractiveResult event', async () => {
      const element = await renderResult();
      const mockCallback = vi.fn();
      const mockInteractiveResult = {
        select: vi.fn(),
        beginDelayedSelect: vi.fn(),
        cancelPendingSelect: vi.fn(),
      };

      element.interactiveResult = mockInteractiveResult;

      const event = new CustomEvent('atomic/resolveInteractiveResult', {
        detail: mockCallback,
        bubbles: true,
        cancelable: true,
      });

      element.dispatchEvent(event);

      expect(mockCallback).toHaveBeenCalledWith(mockInteractiveResult);
      expect(event.defaultPrevented).toBe(true);
    });

    it('should not call callback when interactive result is not set', async () => {
      const element = await renderResult();
      const mockCallback = vi.fn();

      // biome-ignore lint/suspicious/noExplicitAny: testing undefined value
      element.interactiveResult = undefined as any;

      const event = new CustomEvent('atomic/resolveInteractiveResult', {
        detail: mockCallback,
        bubbles: true,
        cancelable: true,
      });

      element.dispatchEvent(event);

      expect(mockCallback).not.toHaveBeenCalled();
      expect(event.defaultPrevented).toBe(true);
    });

    it('should resolve stop propagation on atomic/resolveStopPropagation event', async () => {
      const element = await renderResult();
      const mockCallback = vi.fn();

      const event = new CustomEvent('atomic/resolveStopPropagation', {
        detail: mockCallback,
        bubbles: true,
        cancelable: false,
      });

      element.dispatchEvent(event);

      expect(mockCallback).toHaveBeenCalledWith(true);
    });

    it('should resolve display config on atomic/resolveResultDisplayConfig event', async () => {
      const element = await renderResult({
        density: 'comfortable',
        imageSize: 'large',
      });
      const mockCallback = vi.fn();

      const event = new CustomEvent('atomic/resolveResultDisplayConfig', {
        detail: mockCallback,
        bubbles: true,
        cancelable: true,
      });

      element.dispatchEvent(event);

      expect(mockCallback).toHaveBeenCalledWith({
        density: 'comfortable',
        imageSize: 'large',
      });
      expect(event.defaultPrevented).toBe(true);
    });
  });

  describe('lifecycle', () => {
    it('should add hydrated class on connectedCallback', async () => {
      const element = await renderResult();
      await element.updateComplete;
      expect(element.classList.contains('hydrated')).toBe(true);
    });

    it('should unset loading flag on firstUpdated', async () => {
      const {element, bindings} =
        await renderInAtomicInsightInterface<AtomicInsightResult>({
          template: html`<atomic-insight-result
            .result=${buildFakeInsightResult()}
            .content=${renderTemplateContent(defaultTemplateContent)}
            .loadingFlag=${'test-flag'}
          ></atomic-insight-result>`,
          selector: 'atomic-insight-result',
          bindings: (bindings) => {
            bindings.store.state.loadingFlags = [];
            bindings.store.onChange = vi.fn();
            bindings.store.state.resultList = {
              focusOnFirstResultAfterNextSearch: vi.fn(),
              focusOnNextNewResult: vi.fn(),
            };
            return bindings;
          },
        });

      const unsetLoadingFlagSpy = vi.spyOn(bindings.store, 'unsetLoadingFlag');

      element.firstUpdated(new Map());

      expect(unsetLoadingFlagSpy).toHaveBeenCalledWith('test-flag');
    });

    it('should remove event listeners on disconnectedCallback', async () => {
      const element = await renderResult();
      const removeEventListenerSpy = vi.spyOn(element, 'removeEventListener');

      element.disconnectedCallback();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'atomic/resolveResult',
        expect.any(Function)
      );
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'atomic/resolveInteractiveResult',
        expect.any(Function)
      );
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'atomic/resolveStopPropagation',
        expect.any(Function)
      );
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'atomic/resolveResultDisplayConfig',
        expect.any(Function)
      );
    });
  });

  describe('display properties', () => {
    it.each<{density: ItemDisplayDensity}>([
      {density: 'normal'},
      {density: 'comfortable'},
      {density: 'compact'},
    ])('should render with density: $density', async ({density}) => {
      const element = await renderResult({density});
      expect(element.density).toBe(density);
      await element.updateComplete;
      expect(element.shadowRoot).toBeDefined();
    });

    it.each<{imageSize: ItemDisplayImageSize}>([
      {imageSize: 'icon'},
      {imageSize: 'small'},
      {imageSize: 'large'},
      {imageSize: 'none'},
    ])('should render with imageSize: $imageSize', async ({imageSize}) => {
      const element = await renderResult({imageSize});
      expect(element.imageSize).toBe(imageSize);
      await element.updateComplete;
      expect(element.shadowRoot).toBeDefined();
    });
  });
});
