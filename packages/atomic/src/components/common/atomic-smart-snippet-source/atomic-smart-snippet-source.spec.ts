import type {Result} from '@coveo/headless';
import {html} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {page} from 'vitest/browser';
import {renderLinkWithItemAnalytics} from '@/src/components/common/item-link/item-link';
import {renderInAtomicResult} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-result-fixture';
import {buildFakeSearchEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/search/engine';
import {buildFakeResult} from '@/vitest-utils/testing-helpers/fixtures/headless/search/result';
import type {AtomicSmartSnippetSource as AtomicSmartSnippetSourceType} from './atomic-smart-snippet-source';
import {AtomicSmartSnippetSource} from './atomic-smart-snippet-source';
import './atomic-smart-snippet-source';

vi.mock('@/src/components/common/item-link/item-link', {spy: true});

vi.mock('@coveo/headless', {spy: true});

describe('atomic-smart-snippet-source', () => {
  let mockResult: Result;
  const mockedEngine = buildFakeSearchEngine();

  const locators = {
    getSourceUrlLink: () => page.getByRole('link', {name: mockResult.clickUri}),
    getSourceTitleLink: () => page.getByRole('link', {name: mockResult.title}),
  };

  const parts = (element: AtomicSmartSnippetSourceType) => ({
    sourceUrl: element?.shadowRoot?.querySelector('[part="source-url"]'),
    sourceTitle: element?.shadowRoot?.querySelector('[part="source-title"]'),
  });

  beforeEach(async () => {
    mockResult = buildFakeResult({
      title: 'Test Result Title',
      clickUri: 'https://example.com/test',
      uri: 'https://example.com/test',
      uniqueId: 'test-unique-id',
    });
  });

  const renderComponent = async ({
    source = mockResult,
    anchorAttributes,
    onBeginDelayedSelectSource,
    onCancelPendingSelectSource,
    onSelectSource,
  }: {
    source?: Result;
    anchorAttributes?: Attr[];
    onBeginDelayedSelectSource?: () => void;
    onCancelPendingSelectSource?: () => void;
    onSelectSource?: () => void;
  } = {}) => {
    const {element, atomicResult, atomicInterface} =
      await renderInAtomicResult<AtomicSmartSnippetSourceType>({
        template: html`<atomic-smart-snippet-source
          .source=${source}
          .anchorAttributes=${anchorAttributes}
          @begin-delayed-select-source=${onBeginDelayedSelectSource}
          @cancel-pending-select-source=${onCancelPendingSelectSource}
          @select-source=${onSelectSource}
          .onBeginDelayedSelectSource=${onBeginDelayedSelectSource}
          .onCancelPendingSelectSource=${onCancelPendingSelectSource}
          .onSelectSource=${onSelectSource}
        ></atomic-smart-snippet-source>`,
        selector: 'atomic-smart-snippet-source',
        result: source,
        bindings: (bindings) => {
          bindings.engine = mockedEngine;
          return bindings;
        },
      });

    await atomicInterface.updateComplete;
    await element?.updateComplete;

    const sourceUrlLink = locators.getSourceUrlLink();
    sourceUrlLink.query()?.addEventListener('click', (e) => {
      e.preventDefault();
    });

    const sourceTitleLink = locators.getSourceTitleLink();
    sourceTitleLink.query()?.addEventListener('click', (e) => {
      e.preventDefault();
    });

    return {
      element,
      atomicResult,
      atomicInterface,
      sourceUrlLink,
      sourceTitleLink,
      parts: parts(element),
    };
  };

  describe('#initialize', () => {
    it('should be defined', () => {
      const el = document.createElement('atomic-smart-snippet-source');
      expect(el).toBeInstanceOf(AtomicSmartSnippetSource);
    });

    it('should initialize without error', async () => {
      const {element} = await renderComponent();
      expect(element.error).toBeUndefined();
    });

    it('should add event listener for atomic/resolveResult', async () => {
      const {element} = await renderComponent();
      const addEventListenerSpy = vi.spyOn(element, 'addEventListener');

      element.initialize();

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'atomic/resolveResult',
        expect.any(Function)
      );
    });
  });

  describe('#connectedCallback', () => {
    it('should call renderLinkWithItemAnalytics with expected props', async () => {
      const anchorAttributes = [
        Object.assign(document.createAttribute('data-test'), {
          value: 'test-value',
        }),
      ];

      const renderLinkSpy = vi.mocked(renderLinkWithItemAnalytics);
      renderLinkSpy.mockClear();
      await renderComponent({anchorAttributes});

      expect(renderLinkSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          props: expect.objectContaining({
            title: mockResult.clickUri,
            href: mockResult.clickUri,
            className: 'block truncate',
            part: 'source-url',
            attributes: anchorAttributes,
            onSelect: expect.any(Function),
            onBeginDelayedSelect: expect.any(Function),
            onCancelPendingSelect: expect.any(Function),
          }),
        })
      );

      expect(renderLinkSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          props: expect.objectContaining({
            title: mockResult.title,
            href: mockResult.clickUri,
            className: 'block',
            part: 'source-title',
            attributes: anchorAttributes,
            onSelect: expect.any(Function),
            onBeginDelayedSelect: expect.any(Function),
            onCancelPendingSelect: expect.any(Function),
          }),
        })
      );
    });

    it('should render source links when source is provided', async () => {
      const {sourceTitleLink, sourceUrlLink} = await renderComponent();
      await expect.element(sourceUrlLink).toBeInTheDocument();
      await expect.element(sourceTitleLink).toBeInTheDocument();
    });

    it('should display clickUri in source URL link', async () => {
      const {sourceUrlLink} = await renderComponent();
      await expect
        .element(sourceUrlLink)
        .toHaveTextContent(mockResult.clickUri);
    });

    it('should render atomic-result-text in source title link', async () => {
      const {element} = await renderComponent();
      const resultText = element?.querySelector('atomic-result-text');
      expect(resultText).toBeTruthy();
    });
  });

  describe('#disconnectedCallback', () => {
    it('should remove event listener when component is disconnected', async () => {
      const {element} = await renderComponent();
      const removeEventListenerSpy = vi.spyOn(element, 'removeEventListener');

      element.disconnectedCallback();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'atomic/resolveResult',
        expect.any(Function)
      );
    });
  });

  describe('with atomic/resolveResult event', () => {
    it('should respond to atomic/resolveResult event with source', async () => {
      const {element} = await renderComponent();
      const mockEvent = new CustomEvent('atomic/resolveResult', {
        detail: vi.fn(),
        bubbles: true,
        cancelable: true,
      });
      const eventSpy = mockEvent.detail as ReturnType<typeof vi.fn>;

      element.dispatchEvent(mockEvent);

      expect(eventSpy).toHaveBeenCalledWith(mockResult);
      expect(mockEvent.defaultPrevented).toBe(true);
    });

    it('should not call detail function when source is not set', async () => {
      const {element} = await renderComponent();
      element.source = undefined as unknown as Result;

      const mockEvent = new CustomEvent('atomic/resolveResult', {
        detail: vi.fn(),
        bubbles: true,
        cancelable: true,
      });
      const eventSpy = mockEvent.detail as ReturnType<typeof vi.fn>;

      element.dispatchEvent(mockEvent);

      expect(eventSpy).not.toHaveBeenCalled();
    });
  });

  describe('with anchor attributes', () => {
    it('should apply custom attributes to links', async () => {
      const attr1 = document.createAttribute('data-test');
      attr1.value = 'test-value';
      const attr2 = document.createAttribute('rel');
      attr2.value = 'noopener';

      const {sourceUrlLink, sourceTitleLink} = await renderComponent({
        anchorAttributes: [attr1, attr2],
      });

      const urlLinkElement = sourceUrlLink.query();
      const titleLinkElement = sourceTitleLink.query();

      expect(urlLinkElement?.getAttribute('data-test')).toBe('test-value');
      expect(urlLinkElement?.getAttribute('rel')).toBe('noopener');
      expect(titleLinkElement?.getAttribute('data-test')).toBe('test-value');
      expect(titleLinkElement?.getAttribute('rel')).toBe('noopener');
    });
  });

  describe('with user interactions', () => {
    it('should dispatch selectSource event when source URL link is clicked', async () => {
      const {element, sourceUrlLink} = await renderComponent();
      const eventSpy = vi.fn();
      element.addEventListener('select-source', eventSpy);

      await sourceUrlLink.click();

      expect(eventSpy).toHaveBeenCalled();
    });

    it('should dispatch selectSource event when source title link is clicked', async () => {
      const {element, sourceTitleLink} = await renderComponent();
      const eventSpy = vi.fn();
      element.addEventListener('select-source', eventSpy);

      await sourceTitleLink.click();

      expect(eventSpy).toHaveBeenCalled();
    });
  });

  describe('with callback properties (backward compatibility)', () => {
    it('should call onSelectSource callback when source URL link is clicked', async () => {
      const onSelectSource = vi.fn();
      const {sourceUrlLink} = await renderComponent({onSelectSource});

      await sourceUrlLink.click();

      expect(onSelectSource).toHaveBeenCalled();
    });

    it('should call onSelectSource callback when source title link is clicked', async () => {
      const onSelectSource = vi.fn();
      const {sourceTitleLink} = await renderComponent({onSelectSource});

      await sourceTitleLink.click();

      expect(onSelectSource).toHaveBeenCalled();
    });

    it('should call both event dispatch and callback for selectSource', async () => {
      const onSelectSource = vi.fn();
      const {element, sourceUrlLink} = await renderComponent({onSelectSource});
      const eventSpy = vi.fn();
      element.addEventListener('select-source', eventSpy);

      await sourceUrlLink.click();

      expect(eventSpy).toHaveBeenCalled();
      expect(onSelectSource).toHaveBeenCalled();
    });

    it('should call onBeginDelayedSelectSource callback', async () => {
      const onBeginDelayedSelectSource = vi.fn();
      const {sourceUrlLink} = await renderComponent({
        onBeginDelayedSelectSource,
      });

      sourceUrlLink.query()?.dispatchEvent(new Event('touchstart'));

      expect(onBeginDelayedSelectSource).toHaveBeenCalled();
    });

    it('should call onCancelPendingSelectSource callback', async () => {
      const onCancelPendingSelectSource = vi.fn();
      const {sourceUrlLink} = await renderComponent({
        onCancelPendingSelectSource,
      });

      sourceUrlLink.query()?.dispatchEvent(new Event('touchend'));

      expect(onCancelPendingSelectSource).toHaveBeenCalled();
    });
  });
});
