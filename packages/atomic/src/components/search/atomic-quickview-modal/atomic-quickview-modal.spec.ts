import {buildInteractiveResult, type Result} from '@coveo/headless';
import {html} from 'lit';
import {beforeEach, describe, expect, it, type MockInstance, vi} from 'vitest';
import {page} from 'vitest/browser';
import {renderQuickviewSidebar} from '@/src/components/search/result-template-components/atomic-quickview-sidebar/atomic-quickview-sidebar';
import {renderQuickviewIframe} from '@/src/components/search/result-template-components/quickview-iframe/quickview-iframe';
import {buildQuickviewPreviewBar} from '@/src/components/search/result-template-components/quickview-preview-bar/quickview-preview-bar';
import {getWordsHighlights} from '@/src/components/search/result-template-components/quickview-word-highlight/quickview-word-highlight';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-interface-fixture';
import {buildFakeSearchEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/search/engine';
import type {AtomicQuickviewModal} from './atomic-quickview-modal';
import './atomic-quickview-modal';

vi.mock('@coveo/headless', {spy: true});
vi.mock(
  '@/src/components/search/result-template-components/quickview-iframe/quickview-iframe',
  () => ({
    renderQuickviewIframe: vi.fn(() => html``),
  })
);
vi.mock(
  '@/src/components/search/result-template-components/atomic-quickview-sidebar/atomic-quickview-sidebar',
  () => ({
    renderQuickviewSidebar: vi.fn(() => html``),
  })
);
vi.mock(
  '@/src/components/search/result-template-components/quickview-preview-bar/quickview-preview-bar',
  () => ({
    buildQuickviewPreviewBar: vi.fn(() => html``),
  })
);
vi.mock(
  '@/src/components/search/result-template-components/quickview-word-highlight/quickview-word-highlight',
  () => ({
    getWordsHighlights: vi.fn(() => ({})),
    HIGHLIGHT_PREFIX: 'coveo-highlight',
  })
);

describe('atomic-quickview-modal', () => {
  const mockedEngine = buildFakeSearchEngine();
  const mockResult: Result = {
    title: 'Test Result',
    clickUri: 'https://example.com',
    uniqueId: 'test-id-123',
  } as Result;

  const mockContent = '<html><body>Mock HTML Content</body></html>';

  let consoleWarnSpy: MockInstance;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  const renderQuickviewModal = async ({
    props = {},
  }: {
    props?: Partial<{
      content: string;
      result: Result;
      current: number;
      total: number;
      sandbox: string;
      modalCloseCallback: () => void;
    }>;
  } = {}) => {
    const {element} = await renderInAtomicSearchInterface<AtomicQuickviewModal>(
      {
        template: html`<atomic-quickview-modal
          .content=${props.content}
          .result=${props.result}
          .current=${props.current}
          .total=${props.total}
          .sandbox=${props.sandbox}
          .modalCloseCallback=${props.modalCloseCallback}
        ></atomic-quickview-modal>`,
        selector: 'atomic-quickview-modal',
        bindings: (bindings) => {
          bindings.engine = mockedEngine;
          bindings.engine.state.resultPreview = {
            contentURL: 'https://example.com/preview',
          };
          bindings.engine.state.search = {
            ...bindings.engine.state.search,
            requestId: 'request-123',
            response: {
              ...bindings.engine.state.search.response,
              termsToHighlight: {term1: ['highlight1']},
              phrasesToHighlight: {},
            },
          };
          bindings.store = {
            ...bindings.store,
            isMobile: vi.fn().mockReturnValue(false),
          };
          bindings.createStyleElement = () => document.createElement('style');
          return bindings;
        },
      }
    );

    return {
      element,
      get modal() {
        return element.shadowRoot?.querySelector('atomic-modal');
      },
      parts: (el: AtomicQuickviewModal) => ({
        header: el.shadowRoot?.querySelector('[slot="header"]'),
        body: el.shadowRoot?.querySelector('[slot="body"]'),
        footer: el.shadowRoot?.querySelector('[slot="footer"]'),
      }),
    };
  };

  describe('when initializing', () => {
    it('should initialize minimizeSidebar based on mobile state', async () => {
      const {element} = await renderQuickviewModal();
      // biome-ignore lint/suspicious/noExplicitAny: accessing private property for testing
      expect((element as any).minimizeSidebar).toBe(
        element.bindings.store.isMobile()
      );
    });

    it('should not set error on initialization', async () => {
      const {element} = await renderQuickviewModal();
      expect(element.error).toBeUndefined();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });

  describe('when modal is closed', () => {
    it('should not render header content when result is undefined', async () => {
      const {parts, element} = await renderQuickviewModal({
        props: {content: mockContent},
      });
      const header = parts(element).header;
      expect(header).toBeNull();
    });

    it('should have isOpen as false when content or result is missing', async () => {
      const {modal} = await renderQuickviewModal({
        props: {content: mockContent},
      });
      expect(modal?.isOpen).toBe(false);
    });
  });

  describe('when modal is open', () => {
    it('should render the atomic-modal component', async () => {
      const {modal} = await renderQuickviewModal({
        props: {content: mockContent, result: mockResult},
      });
      expect(modal).toBeTruthy();
    });

    it('should have isOpen as true when both content and result are provided', async () => {
      const {modal} = await renderQuickviewModal({
        props: {content: mockContent, result: mockResult},
      });
      expect(modal?.isOpen).toBe(true);
    });

    it('should set fullscreen based on mobile state', async () => {
      const {modal, element} = await renderQuickviewModal({
        props: {content: mockContent, result: mockResult},
      });
      expect(modal?.fullscreen).toBe(element.bindings.store.isMobile());
    });

    it('should render header with result title', async () => {
      await renderQuickviewModal({
        props: {content: mockContent, result: mockResult},
      });

      const titleElement = await page
        .getByRole('link', {name: mockResult.title})
        .element();
      expect(titleElement).toBeTruthy();
    });

    it('should render close button with correct label', async () => {
      const {element} = await renderQuickviewModal({
        props: {content: mockContent, result: mockResult},
      });

      const closeButton = await page
        .getByRole('button', {name: element.bindings.i18n.t('close')})
        .element();
      expect(closeButton).toBeTruthy();
    });

    it('should call buildInteractiveResult with engine and result', async () => {
      const {element} = await renderQuickviewModal({
        props: {content: mockContent, result: mockResult},
      });

      expect(buildInteractiveResult).toHaveBeenCalledWith(
        element.bindings.engine,
        {
          options: {result: mockResult},
        }
      );
    });

    it('should render renderQuickviewSidebar component', async () => {
      await renderQuickviewModal({
        props: {content: mockContent, result: mockResult},
      });

      expect(vi.mocked(renderQuickviewSidebar)).toHaveBeenCalled();
    });

    it('should render renderQuickviewIframe component with correct props', async () => {
      await renderQuickviewModal({
        props: {
          content: mockContent,
          result: mockResult,
          sandbox: 'allow-scripts',
        },
      });

      expect(vi.mocked(renderQuickviewIframe)).toHaveBeenCalledWith(
        expect.objectContaining({
          props: expect.objectContaining({
            title: mockResult.title,
            src: 'https://example.com/preview',
            sandbox: 'allow-scripts',
            uniqueIdentifier: 'test-id-123request-123',
            content: mockContent,
          }),
        })
      );
    });

    it('should render buildQuickviewPreviewBar', async () => {
      await renderQuickviewModal({
        props: {content: mockContent, result: mockResult},
      });

      expect(vi.mocked(buildQuickviewPreviewBar)).toHaveBeenCalled();
    });
  });

  describe('when rendering footer', () => {
    it('should render previous button', async () => {
      const {element} = await renderQuickviewModal({
        props: {
          content: mockContent,
          result: mockResult,
          current: 2,
          total: 10,
        },
      });

      const prevButton = await page
        .getByRole('button', {
          name: element.bindings.i18n.t('quickview-previous'),
        })
        .element();
      expect(prevButton).toBeTruthy();
    });

    it('should render next button', async () => {
      const {element} = await renderQuickviewModal({
        props: {
          content: mockContent,
          result: mockResult,
          current: 2,
          total: 10,
        },
      });

      const nextButton = await page
        .getByRole('button', {name: element.bindings.i18n.t('quickview-next')})
        .element();
      expect(nextButton).toBeTruthy();
    });

    it('should display current and total count', async () => {
      const {element} = await renderQuickviewModal({
        props: {
          content: mockContent,
          result: mockResult,
          current: 5,
          total: 20,
        },
      });

      const countText = await page
        .getByText(
          element.bindings.i18n.t('showing-results-of', {
            first: 5,
            total: 20,
          })
        )
        .element();
      expect(countText).toBeTruthy();
    });

    it('should disable previous button when current is 1', async () => {
      const {element} = await renderQuickviewModal({
        props: {
          content: mockContent,
          result: mockResult,
          current: 1,
          total: 10,
        },
      });

      const prevButton = await page
        .getByRole('button', {
          name: element.bindings.i18n.t('quickview-previous'),
        })
        .element();
      expect(prevButton).toHaveProperty('disabled', true);
    });

    it('should disable next button when current equals total', async () => {
      const {element} = await renderQuickviewModal({
        props: {
          content: mockContent,
          result: mockResult,
          current: 10,
          total: 10,
        },
      });

      const nextButton = await page
        .getByRole('button', {name: element.bindings.i18n.t('quickview-next')})
        .element();
      expect(nextButton).toHaveProperty('disabled', true);
    });
  });

  describe('when calling reset', () => {
    it('should reset all state properties', async () => {
      const {element} = await renderQuickviewModal({
        props: {content: mockContent, result: mockResult},
      });

      await element.reset();

      expect(element.content).toBeUndefined();
      expect(element.result).toBeUndefined();
      // biome-ignore lint/suspicious/noExplicitAny: accessing private property for testing
      expect((element as any).minimizeSidebar).toBe(false);
      // biome-ignore lint/suspicious/noExplicitAny: accessing private property for testing
      expect((element as any).highlightKeywords).toEqual({
        highlightNone: false,
        keywords: {},
      });
    });
  });

  describe('when closing modal', () => {
    it('should clear content and result', async () => {
      const {modal, element} = await renderQuickviewModal({
        props: {content: mockContent, result: mockResult},
      });

      const closeHandler = modal?.close;
      closeHandler?.();
      await element.updateComplete;

      expect(element.content).toBeUndefined();
      expect(element.result).toBeUndefined();
    });

    it('should call modalCloseCallback when provided', async () => {
      const mockCallback = vi.fn();
      const {modal, element} = await renderQuickviewModal({
        props: {
          content: mockContent,
          result: mockResult,
          modalCloseCallback: mockCallback,
        },
      });

      const closeHandler = modal?.close;
      closeHandler?.();
      await element.updateComplete;

      expect(mockCallback).toHaveBeenCalledOnce();
    });
  });

  describe('when dispatching events', () => {
    it('should dispatch atomic/quickview/next event when next button is clicked', async () => {
      const {element} = await renderQuickviewModal({
        props: {
          content: mockContent,
          result: mockResult,
          current: 1,
          total: 10,
        },
      });

      const eventPromise = new Promise<void>((resolve) => {
        element.addEventListener('atomic/quickview/next', () => resolve());
      });

      const nextButton = page.getByRole('button', {
        name: element.bindings.i18n.t('quickview-next'),
      });
      await nextButton.click();

      await expect(eventPromise).resolves.toBeUndefined();
    });

    it('should dispatch atomic/quickview/previous event when previous button is clicked', async () => {
      const {element} = await renderQuickviewModal({
        props: {
          content: mockContent,
          result: mockResult,
          current: 5,
          total: 10,
        },
      });

      const eventPromise = new Promise<void>((resolve) => {
        element.addEventListener('atomic/quickview/previous', () => resolve());
      });

      const prevButton = page.getByRole('button', {
        name: element.bindings.i18n.t('quickview-previous'),
      });
      await prevButton.click();

      await expect(eventPromise).resolves.toBeUndefined();
    });
  });

  describe('when computing unique identifier', () => {
    it('should combine result uniqueId with requestId', async () => {
      const {element} = await renderQuickviewModal({
        props: {content: mockContent, result: mockResult},
      });

      // biome-ignore lint/suspicious/noExplicitAny: accessing private getter for testing
      const identifier = (element as any).quickviewUniqueIdentifier;
      expect(identifier).toBe('test-id-123request-123');
    });

    it('should return only requestId when result is undefined', async () => {
      const {element} = await renderQuickviewModal({
        props: {content: mockContent},
      });

      // biome-ignore lint/suspicious/noExplicitAny: accessing private getter for testing
      const identifier = (element as any).quickviewUniqueIdentifier;
      expect(identifier).toBe('request-123');
    });
  });

  describe('when getting quickview source', () => {
    it('should get contentURL from engine state', async () => {
      const {element} = await renderQuickviewModal({
        props: {content: mockContent, result: mockResult},
      });

      // biome-ignore lint/suspicious/noExplicitAny: accessing private getter for testing
      const src = (element as any).quickviewSrc;
      expect(src).toBe('https://example.com/preview');
    });
  });

  describe('when managing highlight scripts', () => {
    it('should call getWordsHighlights when iframe ref is set', async () => {
      await renderQuickviewModal({
        props: {content: mockContent, result: mockResult},
      });

      const iframeMockCall = vi.mocked(renderQuickviewIframe).mock.calls[0];
      const onSetIframeRef = iframeMockCall?.[0].props.onSetIframeRef;

      if (onSetIframeRef) {
        const mockIframeRef = document.createElement('iframe');
        await onSetIframeRef(mockIframeRef as HTMLIFrameElement);

        expect(vi.mocked(getWordsHighlights)).toHaveBeenCalled();
      }
    });
  });

  describe('when updating component', () => {
    it('should remain connected after highlightKeywords change', async () => {
      const {element} = await renderQuickviewModal({
        props: {content: mockContent, result: mockResult},
      });

      // biome-ignore lint/suspicious/noExplicitAny: accessing private property for testing
      (element as any).highlightKeywords = {
        highlightNone: true,
        keywords: {},
      };

      await element.updateComplete;

      expect(element.isConnected).toBe(true);
    });
  });
});
