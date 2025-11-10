import type {Result} from '@coveo/headless';
import {html} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import type {
  ItemDisplayDensity,
  ItemDisplayImageSize,
  ItemDisplayLayout,
} from '@/src/components';
import type {ItemRenderingFunction} from '@/src/components/common/item-list/item-list-common';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-interface-fixture';
import {buildFakeResult} from '@/vitest-utils/testing-helpers/fixtures/headless/search/result';
import {AtomicResult} from './atomic-result';

vi.mock('@coveo/headless', {spy: true});

describe('atomic-result', () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleWarnSpy?.mockRestore();
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  const renderResult = async (
    options: {
      result?: Result;
      content?: ParentNode;
      linkContent?: ParentNode;
      display?: ItemDisplayLayout;
      density?: ItemDisplayDensity;
      imageSize?: ItemDisplayImageSize;
      loadingFlag?: string;
      renderingFunction?: ItemRenderingFunction;
    } = {}
  ) => {
    const {
      result = buildFakeResult(),
      linkContent = (() => {
        const fragment = document.createDocumentFragment();
        const div = document.createElement('atomic-result-text');
        fragment.appendChild(div);
        return fragment;
      })(),
      display = 'list',
      density = 'normal',
      imageSize = 'icon',
      loadingFlag = 'atomic-result',
      renderingFunction,
    } = options;

    const content =
      'content' in options
        ? options.content
        : renderTemplateContent(defaultTemplateContent);
    const {element} = await renderInAtomicSearchInterface<AtomicResult>({
      template: html`<atomic-result
        .result=${result}
        .content=${content}
        .linkContent=${linkContent}
        .display=${display}
        .density=${density}
        .imageSize=${imageSize}
        .stopPropagation=${true}
        .loadingFlag=${loadingFlag}
        .renderingFunction=${renderingFunction}
      ></atomic-result>`,
      selector: 'atomic-result',
      bindings: (bindings) => {
        bindings.store.onChange = vi.fn();
        bindings.store.state.resultList = {
          focusOnFirstResultAfterNextSearch: vi.fn(),
          focusOnNextNewResult: vi.fn(),
        };
        bindings.store.state.loadingFlags = [];
        return bindings;
      },
    });
    return element;
  };

  it('should initialize', async () => {
    const element = await renderResult();
    expect(element).toBeInstanceOf(AtomicResult);
  });

  it.each<{
    prop: 'density' | 'display' | 'imageSize';
    invalidValue: string;
  }>([
    {
      prop: 'density',
      invalidValue: 'invalid',
    },
    {
      prop: 'display',
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
    prop: 'density' | 'display' | 'imageSize';
    validValue: ItemDisplayDensity | ItemDisplayLayout | ItemDisplayImageSize;
    invalidValue: string;
  }>([
    {
      prop: 'density',
      validValue: 'normal',
      invalidValue: 'invalid',
    },
    {
      prop: 'display',
      validValue: 'list',
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

  it('should click the link container when the display is "grid"', async () => {
    const clickLinkContainerSpy = vi.fn();
    const element = await renderResult({
      display: 'grid',
    });

    element.clickLinkContainer = clickLinkContainerSpy;

    const clickEvent = new MouseEvent('click');
    element.dispatchEvent(clickEvent);
    expect(clickLinkContainerSpy).toHaveBeenCalled();
  });

  it('should not click the link container when the display is "list"', async () => {
    const clickLinkContainerSpy = vi.fn();
    const element = await renderResult({
      display: 'list',
    });

    element.clickLinkContainer = clickLinkContainerSpy;

    const clickEvent = new MouseEvent('click');
    element.dispatchEvent(clickEvent);
    expect(clickLinkContainerSpy).not.toHaveBeenCalled();
  });

  it('should not click the link container when the display is "table"', async () => {
    const clickLinkContainerSpy = vi.fn();
    const element = await renderResult({
      display: 'table',
    });

    element.clickLinkContainer = clickLinkContainerSpy;

    const clickEvent = new MouseEvent('click');
    element.dispatchEvent(clickEvent);
    expect(clickLinkContainerSpy).not.toHaveBeenCalled();
  });

  it('should render default template content', async () => {
    const element = await renderResult();
    const resultRoot = element.shadowRoot!.querySelector('.result-root');
    expect(resultRoot?.innerHTML).toContain('atomic-result-section-name');
    expect(resultRoot?.innerHTML).toContain('atomic-result-link');
  });

  it('should unset the loading flag on first update', async () => {
    const mockUnsetLoadingFlag = vi.fn();
    const loadingFlag = 'test-loading-flag';

    const element = await renderResult({
      loadingFlag,
    });

    element.store = {
      ...element.store!,
      unsetLoadingFlag: mockUnsetLoadingFlag,
    };

    (
      element as {
        firstUpdated: (changedProperties: Map<string, unknown>) => void;
      }
    ).firstUpdated(new Map());

    expect(mockUnsetLoadingFlag).toHaveBeenCalledWith(loadingFlag);
  });

  describe('#clickLinkContainer', () => {
    it('should click the anchor element when found', async () => {
      const element = await renderResult();
      const mockClick = vi.fn();
      const mockAnchor = {click: mockClick};
      const mockQuerySelector = vi.fn().mockReturnValue(mockAnchor);
      vi.spyOn(element.shadowRoot!, 'querySelector').mockImplementation(
        mockQuerySelector
      );

      element.clickLinkContainer();

      expect(mockQuerySelector).toHaveBeenCalledWith(
        '.link-container > atomic-result-link a:not([slot])'
      );
      expect(mockClick).toHaveBeenCalled();
    });

    it('should not throw when anchor element is not found', async () => {
      const element = await renderResult();

      vi.spyOn(element.shadowRoot!, 'querySelector').mockReturnValue(null);

      expect(() => element.clickLinkContainer()).not.toThrow();
    });

    it('should not throw when shadowRoot is null', async () => {
      const element = await renderResult();

      Object.defineProperty(element, 'shadowRoot', {
        get: () => null,
        configurable: true,
      });

      expect(() => element.clickLinkContainer()).not.toThrow();
    });
  });

  describe('when using the default rendering function', () => {
    it('should not add "with-sections" class when content does not have sections', async () => {
      const element = await renderResult({
        content: renderTemplateContent('<div>No Sections</div>'),
      });
      const resultRoot = element.shadowRoot!.querySelector('.result-root');
      expect(resultRoot?.classList).not.toContain('with-sections');
    });

    it('should add "with-sections" class when content has sections', async () => {
      const element = await renderResult();
      const resultRoot = element.shadowRoot!.querySelector('.result-root');
      expect(resultRoot?.classList).toContain('with-sections');
    });
  });

  describe('when using a custom rendering function', () => {
    const renderingFunction: ItemRenderingFunction = vi.fn(
      (result, resultRootRef, linkContainerRef) => {
        resultRootRef.textContent = `Custom Result: ${result.ec_name}`;
        linkContainerRef.textContent = 'Custom Link Content';
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

    it('should render custom link content in link container', async () => {
      const element = await renderResult({
        renderingFunction,
      });
      const linkContainer =
        element.shadowRoot!.querySelector('.link-container');
      expect(linkContainer?.textContent).toContain('Custom Link Content');
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
          '<atomic-result-section-visual">Custom</atomic-result-section-visual>'
      );
      const element = await renderResult({
        renderingFunction: renderingFunctionWithSections,
      });
      expect(renderingFunctionWithSections).toHaveBeenCalled();
      const resultRoot = element.shadowRoot!.querySelector('.result-root');
      expect(resultRoot?.classList).toContain('with-sections');
    });
  });

  describe('when content is undefined', () => {
    describe('#connectedCallback', () => {
      it('should log warning', async () => {
        await renderResult({content: undefined});
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          'atomic-result: content property is undefined. Cannot create layout.',
          expect.any(AtomicResult)
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
          'atomic-result: content property is undefined. Cannot get content HTML.',
          expect.any(AtomicResult)
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

const defaultTemplateContent = `<atomic-result-section-name>
                <atomic-result-link class="font-bold"></atomic-result-link>
              </atomic-result-section-name>
              <atomic-result-section-visual>
                <atomic-result-field-condition if-defined="ec_thumbnails">
                  <atomic-result-image field="ec_thumbnails"></atomic-result-image>
                </atomic-result-field-condition>
              </atomic-result-section-visual>
              <atomic-result-section-metadata>
                <atomic-result-field-condition if-defined="ec_brand">
                  <atomic-result-text field="ec_brand" class="text-neutral-dark block"></atomic-result-text>
                </atomic-result-field-condition>
                <atomic-result-field-condition if-defined="cat_available_sizes">
                  <atomic-result-multi-value-text
                    field="cat_available_sizes"
                  ></atomic-result-multi-value-text>
                </atomic-result-field-condition>
                <atomic-result-field-condition if-defined="ec_rating">
                  <atomic-result-rating field="ec_rating"></atomic-result-rating>
                </atomic-result-field-condition>
              </atomic-result-section-metadata>
              <atomic-result-section-emphasized>
                <atomic-result-price currency="USD"></atomic-result-price>
              </atomic-result-section-emphasized>
              <atomic-result-section-children>
                <atomic-result-children></atomic-result-children>
              </atomic-result-section-children>`;
