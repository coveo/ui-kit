import type {Result as InsightResult} from '@coveo/headless/insight';
import {html} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import type {
  ItemDisplayDensity,
  ItemDisplayImageSize,
} from '@/src/components/common/layout/item-layout-utils';
import {renderInAtomicInsightInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/insight/atomic-insight-interface-fixture';
import {buildFakeResult} from '@/vitest-utils/testing-helpers/fixtures/headless/search/result';
import {AtomicInsightResult} from './atomic-insight-result';

vi.mock('@coveo/headless/insight', {spy: true});

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
    } = {}
  ) => {
    const {
      result = buildFakeResult() as InsightResult,
      density = 'normal',
      imageSize = 'icon',
      loadingFlag = 'atomic-insight-result',
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
        ></atomic-insight-result>`,
        selector: 'atomic-insight-result',
        bindings: (bindings) => {
          bindings.store.onChange = vi.fn();
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

  it('should handle click and stop propagation', async () => {
    const element = await renderResult();
    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
    });
    const stopPropagationSpy = vi.spyOn(clickEvent, 'stopPropagation');
    element.dispatchEvent(clickEvent);
    expect(stopPropagationSpy).toHaveBeenCalled();
  });

  describe('#firstUpdated', () => {
    it('should unset loading flag when loadingFlag and store are provided', async () => {
      const loadingFlag = 'test-loading-flag';
      const element = await renderResult({loadingFlag});

      expect(element.store!.unsetLoadingFlag).toHaveBeenCalledWith(loadingFlag);
    });

    it('should not throw when store is undefined', async () => {
      const element = await renderResult();
      element.store = undefined;
      element.requestUpdate();

      await expect(element.updateComplete).resolves.toBeTruthy();
    });

    it('should not throw when loadingFlag is undefined', async () => {
      const element = await renderResult({loadingFlag: undefined});

      await expect(element.updateComplete).resolves.toBeTruthy();
    });
  });

  describe('when content has sections', () => {
    it('should add "with-sections" class', async () => {
      const element = await renderResult();
      const resultRoot = element.shadowRoot!.querySelector('.result-root');
      expect(resultRoot?.classList).toContain('with-sections');
    });
  });

  describe('when content does not have sections', () => {
    it('should not add "with-sections" class', async () => {
      const element = await renderResult({
        content: renderTemplateContent('<div>No Sections</div>'),
      });
      const resultRoot = element.shadowRoot!.querySelector('.result-root');
      expect(resultRoot?.classList).not.toContain('with-sections');
    });
  });

  describe('when content is undefined', () => {
    describe('#connectedCallback', () => {
      it('should log warning', async () => {
        await renderResult({content: undefined});
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          'atomic-insight-result: content property is undefined. Cannot create layout.',
          expect.any(AtomicInsightResult)
        );
      });

      it('should return early and not create layout', async () => {
        const element = await renderResult({content: undefined});
        const layoutProperty = (element as unknown as {layout: unknown}).layout;
        expect(layoutProperty).toBeUndefined();
      });

      it('should not throw error', async () => {
        expect(async () => {
          await renderResult({content: undefined});
        }).not.toThrow();
      });
    });

    describe('#getContentHTML', () => {
      it('should log warning', async () => {
        const element = await renderResult({content: undefined});
        const getContentHTMLMethod = (
          element as unknown as {getContentHTML: () => string}
        ).getContentHTML.bind(element);

        getContentHTMLMethod();

        expect(consoleWarnSpy).toHaveBeenCalledWith(
          'atomic-insight-result: content property is undefined. Cannot get content HTML.',
          expect.any(AtomicInsightResult)
        );
      });

      it('should return empty string', async () => {
        const element = await renderResult({content: undefined});
        const getContentHTMLMethod = (
          element as unknown as {getContentHTML: () => string}
        ).getContentHTML.bind(element);
        const result = getContentHTMLMethod();
        expect(result).toBe('');
      });

      it('should not throw error', async () => {
        const element = await renderResult({content: undefined});
        const getContentHTMLMethod = (
          element as unknown as {getContentHTML: () => string}
        ).getContentHTML.bind(element);

        expect(() => getContentHTMLMethod()).not.toThrow();
      });
    });

    describe('#render', () => {
      it('should not call layout methods when layout is undefined', async () => {
        const element = await renderResult({content: undefined});

        expect(() => element.render()).not.toThrow();

        const componentRoot =
          element.shadowRoot!.querySelector('.result-component');
        const resultRoot = element.shadowRoot!.querySelector('.result-root');
        expect(componentRoot).toBeTruthy();
        expect(resultRoot).toBeNull();
      });
    });
  });

  describe('event listeners', () => {
    describe('atomic/resolveResult', () => {
      it('should resolve the result', async () => {
        const element = await renderResult();
        const mockHandler = vi.fn();

        const event = new CustomEvent('atomic/resolveResult', {
          detail: mockHandler,
          bubbles: true,
          cancelable: true,
        });

        element.dispatchEvent(event);

        expect(mockHandler).toHaveBeenCalledWith(element.result);
        expect(event.defaultPrevented).toBe(true);
      });
    });

    describe('atomic/resolveInteractiveResult', () => {
      it('should resolve the interactive result when it exists', async () => {
        const element = await renderResult();
        const mockInteractiveResult = {select: vi.fn()};
        element.interactiveResult = mockInteractiveResult as never;

        const mockHandler = vi.fn();
        const event = new CustomEvent('atomic/resolveInteractiveResult', {
          detail: mockHandler,
          bubbles: true,
          cancelable: true,
        });

        element.dispatchEvent(event);

        expect(mockHandler).toHaveBeenCalledWith(mockInteractiveResult);
        expect(event.defaultPrevented).toBe(true);
      });

      it('should not call handler when interactive result is undefined', async () => {
        const element = await renderResult();
        element.interactiveResult = undefined as never;

        const mockHandler = vi.fn();
        const event = new CustomEvent('atomic/resolveInteractiveResult', {
          detail: mockHandler,
          bubbles: true,
          cancelable: true,
        });

        element.dispatchEvent(event);

        expect(mockHandler).not.toHaveBeenCalled();
        expect(event.defaultPrevented).toBe(true);
      });
    });

    describe('atomic/resolveStopPropagation', () => {
      it('should resolve stopPropagation property', async () => {
        const element = await renderResult();
        const mockHandler = vi.fn();

        const event = new CustomEvent('atomic/resolveStopPropagation', {
          detail: mockHandler,
          bubbles: true,
        });

        element.dispatchEvent(event);

        expect(mockHandler).toHaveBeenCalledWith(element.stopPropagation);
      });
    });

    describe('atomic/resolveResultDisplayConfig', () => {
      it('should resolve display config', async () => {
        const density: ItemDisplayDensity = 'comfortable';
        const imageSize: ItemDisplayImageSize = 'large';
        const element = await renderResult({density, imageSize});
        const mockHandler = vi.fn();

        const event = new CustomEvent('atomic/resolveResultDisplayConfig', {
          detail: mockHandler,
          bubbles: true,
          cancelable: true,
        });

        element.dispatchEvent(event);

        expect(mockHandler).toHaveBeenCalledWith({
          density,
          imageSize,
        });
        expect(event.defaultPrevented).toBe(true);
      });
    });
  });

  describe('#disconnectedCallback', () => {
    it('should remove event listeners', async () => {
      const element = await renderResult();
      const mockHandler = vi.fn();

      element.disconnectedCallback();

      const event = new CustomEvent('atomic/resolveResult', {
        detail: mockHandler,
        bubbles: true,
        cancelable: true,
      });

      element.dispatchEvent(event);

      expect(mockHandler).not.toHaveBeenCalled();
    });
  });
});

const renderTemplateContent = (content: string) => {
  const fragment = document.createDocumentFragment();
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = content;
  while (tempDiv.firstChild) {
    fragment.appendChild(tempDiv.firstChild);
  }
  return fragment;
};

const defaultTemplateContent = `<atomic-result-section-title>
                <atomic-result-link class="font-bold"></atomic-result-link>
              </atomic-result-section-title>
              <atomic-result-section-visual>
                <atomic-result-icon></atomic-result-icon>
              </atomic-result-section-visual>
              <atomic-result-section-metadata>
                <atomic-result-text field="source" class="text-neutral-dark block"></atomic-result-text>
              </atomic-result-section-metadata>
              <atomic-result-section-excerpt>
                <atomic-result-text field="excerpt"></atomic-result-text>
              </atomic-result-section-excerpt>`;
