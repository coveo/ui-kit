import type {Result as InsightResult} from '@coveo/headless/insight';
import {html} from 'lit';
import {beforeEach, describe, expect, it, type MockInstance, vi} from 'vitest';
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

const templateContentWithSections = `
<atomic-result-section-badges>
  <atomic-result-badge
    class="badge-documenttype"
    field="documenttype"
  >
  </atomic-result-badge>
</atomic-result-section-badges>
<atomic-result-section-title>
  <atomic-result-link>
    <a slot="attributes" target="_self"></a>
  </atomic-result-link>
</atomic-result-section-title>
`;

const renderTemplateContent = (templateHtml: string) => {
  const template = document.createElement('template');
  template.innerHTML = templateHtml;
  return template.content;
};

describe('atomic-insight-result', () => {
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

  describe('when density prop is invalid', () => {
    it('should set error', async () => {
      const element = await renderResult();

      expect(element.error).toBeUndefined();

      // biome-ignore lint/suspicious/noExplicitAny: testing invalid values
      (element as any).density = 'invalid';
      await element.updateComplete;

      expect(element.error).toBeDefined();
      expect(element.error.message).toMatch(/density/i);
    });
  });

  describe('when imageSize prop is invalid', () => {
    it('should set error', async () => {
      const element = await renderResult();

      expect(element.error).toBeUndefined();

      // biome-ignore lint/suspicious/noExplicitAny: testing invalid values
      (element as any).imageSize = 'invalid';
      await element.updateComplete;

      expect(element.error).toBeDefined();
      expect(element.error.message).toMatch(/imageSize/i);
    });
  });

  describe('when content is provided', () => {
    describe('#getContentHTML', () => {
      it('should return HTML string of the content', async () => {
        const element = await renderResult({
          content: renderTemplateContent(
            '<atomic-result-text field="title"></atomic-result-text>'
          ),
        });
        const getContentHTMLMethod = (
          element as unknown as {getContentHTML: () => string}
        ).getContentHTML.bind(element);

        const html = getContentHTMLMethod();

        expect(html).toContain('atomic-result-text');
        expect(html).toContain('field="title"');
      });

      it('should return HTML for multiple children', async () => {
        const element = await renderResult({
          content: renderTemplateContent('<div>First</div><span>Second</span>'),
        });
        const getContentHTMLMethod = (
          element as unknown as {getContentHTML: () => string}
        ).getContentHTML.bind(element);

        const html = getContentHTMLMethod();

        expect(html).toContain('<div>First</div>');
        expect(html).toContain('<span>Second</span>');
      });
    });

    describe('layout creation', () => {
      it('should create layout with provided content', async () => {
        const element = await renderResult({
          content: renderTemplateContent('<div>Content</div>'),
        });
        const layoutController = (
          element as unknown as {
            itemLayoutController: {getLayout: () => unknown};
          }
        ).itemLayoutController;

        expect(layoutController.getLayout()).toBeDefined();
      });

      it('should create layout with correct density', async () => {
        const element = await renderResult({
          content: renderTemplateContent('<div>Content</div>'),
          density: 'comfortable',
        });
        const layoutController = (
          element as unknown as {
            itemLayoutController: {
              getLayout: () => {density: string} | null;
            };
          }
        ).itemLayoutController;

        expect(layoutController.getLayout()?.density).toBe('comfortable');
      });

      it('should create layout with correct imageSize', async () => {
        const element = await renderResult({
          content: renderTemplateContent('<div>Content</div>'),
          imageSize: 'large',
        });
        const layoutController = (
          element as unknown as {
            itemLayoutController: {
              getLayout: () => {imageSize: string} | null;
            };
          }
        ).itemLayoutController;

        expect(layoutController.getLayout()?.imageSize).toBe('large');
      });
    });

    describe('content rendering', () => {
      it('should render content HTML in result root', async () => {
        const element = await renderResult();
        const contentHTML = element.shadowRoot
          ?.querySelector('.result-root')
          ?.innerHTML.trim();
        expect(contentHTML).toContain('atomic-result-text');
      });

      it('should render atomic-result-text with correct field attribute', async () => {
        const element = await renderResult({
          content: renderTemplateContent(
            '<atomic-result-text field="author"></atomic-result-text>'
          ),
        });
        const resultText =
          element.shadowRoot?.querySelector('atomic-result-text');

        expect(resultText).toBeDefined();
        expect(resultText?.getAttribute('field')).toBe('author');
      });

      it('should render multiple result components', async () => {
        const element = await renderResult({
          content: renderTemplateContent(`
            <atomic-result-text field="title"></atomic-result-text>
            <atomic-result-text field="excerpt"></atomic-result-text>
          `),
        });
        const resultTexts =
          element.shadowRoot?.querySelectorAll('atomic-result-text');

        expect(resultTexts?.length).toBe(2);
      });

      it('should render result sections correctly', async () => {
        const element = await renderResult({
          content: renderTemplateContent(templateContentWithSections),
        });

        const badgesSection = element.shadowRoot?.querySelector(
          'atomic-result-section-badges'
        );
        const titleSection = element.shadowRoot?.querySelector(
          'atomic-result-section-title'
        );

        expect(badgesSection).toBeDefined();
        expect(titleSection).toBeDefined();
      });

      it('should render nested content correctly', async () => {
        const element = await renderResult({
          content: renderTemplateContent(`
            <atomic-result-section-title>
              <atomic-result-link>
                <atomic-result-text field="title"></atomic-result-text>
              </atomic-result-link>
            </atomic-result-section-title>
          `),
        });

        const titleSection = element.shadowRoot?.querySelector(
          'atomic-result-section-title'
        );
        const link = titleSection?.querySelector('atomic-result-link');
        const text = link?.querySelector('atomic-result-text');

        expect(titleSection).toBeDefined();
        expect(link).toBeDefined();
        expect(text).toBeDefined();
        expect(text?.getAttribute('field')).toBe('title');
      });
    });

    describe('layout classes', () => {
      it('should not add "with-sections" class when content does not have sections', async () => {
        const element = await renderResult({
          content: renderTemplateContent('<div>No Sections</div>'),
        });
        const resultRoot = element.shadowRoot!.querySelector('.result-root');
        expect(resultRoot?.classList).not.toContain('with-sections');
      });

      it('should add "with-sections" class when content has sections', async () => {
        const element = await renderResult({
          content: renderTemplateContent(templateContentWithSections),
        });
        const resultRoot = element.shadowRoot!.querySelector('.result-root');
        expect(resultRoot?.classList).toContain('with-sections');
      });

      it('should apply density class to result root', async () => {
        const element = await renderResult({
          content: renderTemplateContent(templateContentWithSections),
          density: 'compact',
        });
        const resultRoot = element.shadowRoot!.querySelector('.result-root');
        expect(resultRoot?.classList).toContain('density-compact');
      });

      it('should apply image-size class to result root', async () => {
        const element = await renderResult({
          content: renderTemplateContent(templateContentWithSections),
          imageSize: 'large',
        });
        const resultRoot = element.shadowRoot!.querySelector('.result-root');
        expect(resultRoot?.classList).toContain('image-large');
      });
    });

    describe('interaction with rendering function', () => {
      it('should use rendering function when provided instead of content', async () => {
        const renderingFunction: ItemRenderingFunction = vi.fn(
          (_result, resultRootRef) => {
            resultRootRef.textContent = 'Custom rendering';
            return resultRootRef.outerHTML;
          }
        );

        const element = await renderResult({
          content: renderTemplateContent('<div>Template content</div>'),
          renderingFunction,
        });

        expect(renderingFunction).toHaveBeenCalled();
        const resultRoot = element.shadowRoot?.querySelector('.result-root');
        expect(resultRoot?.textContent).toContain('Custom rendering');
        expect(resultRoot?.innerHTML).not.toContain('Template content');
      });

      it('should pass result to rendering function', async () => {
        const result = buildFakeInsightResult();
        const renderingFunction: ItemRenderingFunction = vi.fn(
          (receivedResult, resultRootRef) => {
            resultRootRef.textContent = receivedResult.title;
            return resultRootRef.outerHTML;
          }
        );

        await renderResult({
          result,
          renderingFunction,
        });

        expect(renderingFunction).toHaveBeenCalledWith(
          result,
          expect.any(HTMLElement),
          undefined
        );
      });
    });
  });

  describe('when content is undefined', () => {
    let consoleWarnSpy: MockInstance;

    beforeEach(() => {
      consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    it('should log warning about missing content', async () => {
      await renderResult({content: undefined});
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'atomic-insight-result: content property is undefined. Cannot create layout.',
        expect.any(AtomicInsightResult)
      );
    });

    it('should not create layout', async () => {
      const element = await renderResult({content: undefined});
      const layoutProperty = (element as unknown as {layout: unknown}).layout;
      expect(layoutProperty).toBeUndefined();
    });

    it('should not throw error', async () => {
      expect(async () => {
        await renderResult({content: undefined});
      }).not.toThrow();
    });

    it('should render nothing when content is undefined and no rendering function', async () => {
      const element = await renderResult({
        content: undefined,
        renderingFunction: undefined,
      });
      await element.updateComplete;

      const resultRoot = element.shadowRoot?.querySelector('.result-root');
      expect(resultRoot).toBeNull();
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
      it('should render nothing when layout is undefined', async () => {
        const element = await renderResult({content: undefined});

        expect(() => element.render()).not.toThrow();

        const resultRoot = element.shadowRoot!.querySelector('.result-root');
        expect(resultRoot).toBeNull();
      });

      it('should handle custom rendering function mode', async () => {
        const renderingFunction: ItemRenderingFunction = vi.fn(
          (_result, resultRootRef) => {
            resultRootRef.textContent = 'Custom content without layout';
            return resultRootRef.outerHTML;
          }
        );

        const element = await renderResult({
          content: undefined,
          renderingFunction,
        });

        expect(renderingFunction).toHaveBeenCalled();
        const resultRoot = element.shadowRoot!.querySelector('.result-root');
        expect(resultRoot?.textContent).toContain(
          'Custom content without layout'
        );
      });
    });

    describe('#updated', () => {
      it('should not throw error when layout is undefined in custom rendering mode', async () => {
        const renderingFunction: ItemRenderingFunction = vi.fn(
          (_result, resultRootRef) => {
            resultRootRef.textContent = 'Updated content';
            return '<div>Updated HTML</div>';
          }
        );

        const element = await renderResult({
          content: undefined,
          renderingFunction,
        });

        expect(() => {
          element.requestUpdate();
        }).not.toThrow();

        await element.updateComplete;
        expect(renderingFunction).toHaveBeenCalled();
      });
    });
  });

  describe('when using a custom rendering function', () => {
    const renderingFunction: ItemRenderingFunction = vi.fn(
      (result, resultRootRef) => {
        resultRootRef.textContent = `Custom Result: ${result.title}`;
        return resultRootRef.outerHTML;
      }
    );

    it('should call the custom rendering function', async () => {
      await renderResult({renderingFunction});
      expect(renderingFunction).toHaveBeenCalled();
    });

    it('should render custom result content in result root', async () => {
      const element = await renderResult({
        renderingFunction,
      });
      const resultRoot = element.shadowRoot!.querySelector('.result-root');
      expect(resultRoot?.textContent).toContain('Custom Result:');
    });

    it('should not add "with-sections" class when content does not have sections', async () => {
      const element = await renderResult({
        renderingFunction,
      });
      const resultRoot = element.shadowRoot!.querySelector('.result-root');
      expect(resultRoot?.classList).not.toContain('with-sections');
    });

    it('should add "with-sections" class when content has sections', async () => {
      const renderingFunctionWithSections: ItemRenderingFunction = vi.fn(
        () =>
          '<atomic-result-section-visual>Custom</atomic-result-section-visual>'
      );
      const element = await renderResult({
        renderingFunction: renderingFunctionWithSections,
      });
      expect(renderingFunctionWithSections).toHaveBeenCalled();
      const resultRoot = element.shadowRoot!.querySelector('.result-root');
      expect(resultRoot?.classList).toContain('with-sections');
    });

    it('should render result-root element', async () => {
      const element = await renderResult({renderingFunction});
      await element.updateComplete;

      const resultRoot = element.shadowRoot?.querySelector('.result-root');
      expect(resultRoot).toBeDefined();
    });
  });

  describe('when atomic/resolveResult event is dispatched', () => {
    it('should resolve result and prevent default', async () => {
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
  });

  describe('when atomic/resolveInteractiveResult event is dispatched', () => {
    it('should resolve interactive result when set', async () => {
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
  });

  describe('when atomic/resolveStopPropagation event is dispatched', () => {
    it('should resolve stop propagation value', async () => {
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
  });

  describe('when atomic/resolveResultDisplayConfig event is dispatched', () => {
    it('should resolve display config and prevent default', async () => {
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

  describe('#connectedCallback', () => {
    it('should add hydrated class', async () => {
      const element = await renderResult();
      await element.updateComplete;
      expect(element.classList.contains('hydrated')).toBe(true);
    });
  });

  describe('#firstUpdated', () => {
    it('should unset loading flag when store is available', async () => {
      const mockUnsetLoadingFlag = vi.fn();
      const loadingFlag = 'test-flag';

      const element = await renderResult({
        loadingFlag,
      });

      element.store = {
        ...element.store!,
        unsetLoadingFlag: mockUnsetLoadingFlag,
      };

      element.firstUpdated(new Map());

      expect(mockUnsetLoadingFlag).toHaveBeenCalledWith(loadingFlag);
    });
  });

  describe('#disconnectedCallback', () => {
    it('should remove event listeners', async () => {
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

  describe('when density prop is set', () => {
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
  });

  describe('when imageSize prop is set', () => {
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
