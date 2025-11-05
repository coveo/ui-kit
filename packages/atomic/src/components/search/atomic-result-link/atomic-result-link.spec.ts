import type {InteractiveResult, Result} from '@coveo/headless';
import {type Locator, page} from '@vitest/browser/context';
import {html, nothing} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import type {InteractiveItemContextController} from '@/src/components/common/item-list/context/interactive-item-context-controller';
import type {ItemContextController} from '@/src/components/common/item-list/context/item-context-controller';
import {renderInAtomicResult} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-result-fixture';
import {buildFakeInteractiveResult} from '@/vitest-utils/testing-helpers/fixtures/headless/interactive-result';
import {buildFakeResult} from '@/vitest-utils/testing-helpers/fixtures/headless/result';
import {AtomicResultLink} from './atomic-result-link';
import './atomic-result-link';

vi.mock('@coveo/headless', {spy: true});

describe('atomic-result-link', () => {
  let mockResult: Result;
  let mockInteractiveResult: InteractiveResult;

  beforeEach(async () => {
    console.error = vi.fn();

    mockResult = buildFakeResult({
      title: 'Test Result Title',
      clickUri: 'https://example.com/result/123',
      uniqueId: 'result-123',
      raw: {
        itemtitle: 'custom-title',
        custom_url_param: 'custom-value',
      },
    });
    mockInteractiveResult = buildFakeInteractiveResult();
  });

  const renderResultLink = async (
    options: {
      hrefTemplate?: string;
      result?: Result;
      interactiveResult?: InteractiveResult;
      slotContent?: string | unknown;
      attributes?: string;
    } = {}
  ) => {
    const resultToUse = 'result' in options ? options.result : mockResult;
    const interactiveResultToUse =
      'interactiveResult' in options
        ? options.interactiveResult
        : mockInteractiveResult;

    const attributesSlot = options.attributes
      ? html`<a slot="attributes" target="_blank" download></a>`
      : nothing;

    const {element, atomicInterface, atomicResult} =
      await renderInAtomicResult<AtomicResultLink>({
        template: html`<atomic-result-link
          .hrefTemplate=${options.hrefTemplate}
        >
          ${ifDefined(options.slotContent)}
          ${attributesSlot}
        </atomic-result-link>`,
        selector: 'atomic-result-link',
        result: resultToUse,
        interactiveResult: interactiveResultToUse,
        bindings: (bindings) => {
          bindings.store.onChange = vi.fn();
          bindings.engine.logger = {warn: vi.fn()} as never;
          return bindings;
        },
      });

    await atomicInterface.updateComplete;
    await atomicResult.updateComplete;
    await element.updateComplete;

    return {
      element,
      atomicResult,
      link: page.getByRole('link'),
      resultText: () => element.querySelector('atomic-result-text'),
      parts: (element: AtomicResultLink) => {
        const qs = (selector: string) =>
          element.shadowRoot?.querySelector(selector);
        return {
          link: qs('a'),
          resultText: qs('atomic-result-text'),
        };
      },
    };
  };

  it('should be defined', () => {
    const el = document.createElement('atomic-result-link');
    expect(el).toBeInstanceOf(AtomicResultLink);
  });

  it('should render nothing when result is not available', async () => {
    const {element} = await renderResultLink({result: undefined});
    expect(element).toBeDefined();
    expect(element?.textContent?.trim()).toBe('');
  });

  it('should render a link with correct href from result clickUri', async () => {
    const {link} = await renderResultLink();

    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://example.com/result/123');
  });

  it('should render default result text when no slot content provided', async () => {
    const {resultText} = await renderResultLink();

    expect(resultText).toBeTruthy();
    expect(resultText()?.getAttribute('field')).toBe('title');
    expect(resultText()?.getAttribute('default')).toBe('no-title');
  });

  it('should render default slot content inside the link element when provided', async () => {
    const {link} = await renderResultLink({
      slotContent: 'Custom link content',
    });

    expect(link.first().element()?.textContent).toContain(
      'Custom link content'
    );
  });

  describe('#initialize', () => {
    it('should set result from controller when available', async () => {
      const {element} = await renderResultLink();

      element.result = undefined;
      expect(element.result).toBe(undefined);

      element.resultController = {
        item: mockResult,
      } as ItemContextController<Result>;

      element.initialize();
      expect(element.result).toBe(mockResult);
    });

    it('should set interactiveResult from controller', async () => {
      const {element} = await renderResultLink();

      element.interactiveResult = undefined;
      expect(element.interactiveResult).toBe(undefined);

      element.interactiveResultController = {
        interactiveItem: mockInteractiveResult,
      } as InteractiveItemContextController<InteractiveResult>;

      element.initialize();
      expect(element.interactiveResult).toBe(mockInteractiveResult);
    });

    it('should dispatch stopPropagation resolution event', async () => {
      const {element} = await renderResultLink();

      if (element) {
        const eventListener = vi.fn();
        element.addEventListener(
          'atomic/resolveStopPropagation',
          eventListener
        );

        element.initialize();

        expect(eventListener).toHaveBeenCalled();
      }
    });
  });

  describe('#disconnectedCallback', () => {
    it('should call cleanup function when component is disconnected', async () => {
      const cleanupSpy = vi.fn();
      const {element} = await renderResultLink();

      // @ts-expect-error private property access for testing
      element.removeLinkEventHandlers = cleanupSpy;

      element?.disconnectedCallback();

      expect(cleanupSpy).toHaveBeenCalledOnce();

      // @ts-expect-error private property access for testing
      expect(element.removeLinkEventHandlers).toBeUndefined();
    });
  });

  describe('when #hrefTemplate is provided', () => {
    let link: Locator;

    const setupTemplate = async (hrefTemplate: string) => {
      const result = await renderResultLink({hrefTemplate});
      link = result.link;
    };

    it('should use template to build href with result field', async () => {
      await setupTemplate('$' + '{clickUri}?id=$' + '{uniqueId}');
      const expectedHref = `https://example.com/result/123?id=result-123`;
      expect(link).toHaveAttribute('href', expectedHref);
    });

    it('should use template with raw fields', async () => {
      await setupTemplate(
        '$' + '{clickUri}?custom=$' + '{raw.custom_url_param}'
      );
      const expectedHref = `https://example.com/result/123?custom=custom-value`;
      expect(link).toHaveAttribute('href', expectedHref);
    });
  });

  it('should apply custom attributes to link when attributes slot is provided', async () => {
    const {link} = await renderResultLink({
      attributes: 'target="_blank" download',
    });

    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('download');
  });

  it('should call #select when link is clicked', async () => {
    const {link, element} = await renderResultLink();

    await link?.click();
    expect(element.interactiveResult?.select).toHaveBeenCalled();
  });

  it('should call #beginDelayedSelect on touchstart', async () => {
    const {link} = await renderResultLink();

    link?.element().dispatchEvent(new MouseEvent('touchstart'));

    expect(mockInteractiveResult.beginDelayedSelect).toHaveBeenCalled();
  });

  it('should handle #hrefTemplate property changes', async () => {
    const {element, link} = await renderResultLink();

    if (element) {
      element.hrefTemplate = '$' + '{clickUri}?updated=true';
    }

    await element?.updateComplete;
    const expectedHref = `${mockResult.clickUri}?updated=true`;
    await expect.element(link).toHaveAttribute('href', expectedHref);
  });

  it('should handle result changes', async () => {
    const {element, link} = await renderResultLink();

    await expect.element(link).toHaveAttribute('href', mockResult.clickUri);

    const newResult = buildFakeResult({
      title: 'Updated Result',
      clickUri: 'https://example.com/updated-result',
    });

    element.result = newResult;

    await element.updateComplete;
    await expect.element(link).toHaveAttribute('href', newResult.clickUri);
  });

  it('should render error component when error occurs', async () => {
    const {element} = await renderResultLink();

    if (element) {
      element.error = new Error('Test error');
    }

    await element?.updateComplete;
    const errorComponent = element?.querySelector('atomic-component-error');
    expect(errorComponent).toBeTruthy();
  });
});
