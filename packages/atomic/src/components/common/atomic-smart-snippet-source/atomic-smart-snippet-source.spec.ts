import type {Result} from '@coveo/headless';
import {html} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {page} from 'vitest/browser';
import {renderInAtomicResult} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-result-fixture';
import {buildFakeSearchEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/search/engine';
import {buildFakeResult} from '@/vitest-utils/testing-helpers/fixtures/headless/search/result';
import {AtomicSmartSnippetSource} from './atomic-smart-snippet-source';
import './atomic-smart-snippet-source';

vi.mock('@coveo/headless', {spy: true});

describe('atomic-smart-snippet-source', () => {
  let mockResult: Result;
  const mockedEngine = buildFakeSearchEngine();

  const locators = {
    getSourceUrlLink: () => page.getByRole('link', {name: mockResult.clickUri}),
    getSourceTitleLink: () => page.getByRole('link', {name: mockResult.title}),
  };

  const parts = (element: AtomicSmartSnippetSource) => ({
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
  }: {
    source?: Result;
    anchorAttributes?: Attr[];
  } = {}) => {
    const {element, atomicResult, atomicInterface} =
      await renderInAtomicResult<AtomicSmartSnippetSource>({
        template: html`<atomic-smart-snippet-source
          .source=${source}
          .anchorAttributes=${anchorAttributes}
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
    it('should render source URL link when source is provided', async () => {
      const {sourceUrlLink} = await renderComponent();
      await expect.element(sourceUrlLink).toBeInTheDocument();
    });

    it('should render source title link when source is provided', async () => {
      const {sourceTitleLink} = await renderComponent();
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

    it('should apply correct CSS classes to source URL link', async () => {
      const {sourceUrlLink} = await renderComponent();
      const linkElement = sourceUrlLink.query();
      expect(linkElement?.classList.contains('block')).toBe(true);
      expect(linkElement?.classList.contains('truncate')).toBe(true);
    });

    it('should apply correct CSS classes to source title link', async () => {
      const {sourceTitleLink} = await renderComponent();
      const linkElement = sourceTitleLink.query();
      expect(linkElement?.classList.contains('block')).toBe(true);
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
      element.addEventListener('selectSource', eventSpy);

      await sourceUrlLink.click();

      expect(eventSpy).toHaveBeenCalled();
    });

    it('should dispatch selectSource event when source title link is clicked', async () => {
      const {element, sourceTitleLink} = await renderComponent();
      const eventSpy = vi.fn();
      element.addEventListener('selectSource', eventSpy);

      await sourceTitleLink.click();

      expect(eventSpy).toHaveBeenCalled();
    });
  });
});
