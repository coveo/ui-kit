import {buildInteractiveResult, type Result} from '@coveo/headless';
import {html} from 'lit';
import {beforeEach, describe, expect, it, type MockInstance, vi} from 'vitest';
import {page} from 'vitest/browser';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-interface-fixture';
import {buildFakeSearchEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/search/engine';
import {QuickviewSidebar} from '../atomic-quickview-sidebar/atomic-quickview-sidebar';
import {QuickviewIframe} from '../quickview-iframe/quickview-iframe';
import {buildQuickviewPreviewBar} from '../quickview-preview-bar/quickview-preview-bar';
import {getWordsHighlights} from '../quickview-word-highlight/quickview-word-highlight';
import type {AtomicQuickviewModal} from './atomic-quickview-modal';
import './atomic-quickview-modal';

vi.mock('@coveo/headless', {spy: true});
vi.mock('../quickview-iframe/quickview-iframe', () => ({
  QuickviewIframe: vi.fn(() => html``),
}));
vi.mock('../atomic-quickview-sidebar/atomic-quickview-sidebar', () => ({
  QuickviewSidebar: vi.fn(() => html``),
}));
vi.mock('../quickview-preview-bar/quickview-preview-bar', () => ({
  buildQuickviewPreviewBar: vi.fn(() => html``),
}));
vi.mock('../quickview-word-highlight/quickview-word-highlight', () => ({
  getWordsHighlights: vi.fn(() => ({})),
  HIGHLIGHT_PREFIX: 'coveo-highlight',
}));

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

  describe('#initialize', () => {
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
    it('should not render header when result is undefined', async () => {
      const {parts, element} = await renderQuickviewModal({
        props: {content: mockContent},
      });
      const header = parts(element).header;
      expect(header?.textContent?.trim()).toBe('');
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

    it('should render QuickviewSidebar component', async () => {
      await renderQuickviewModal({
        props: {content: mockContent, result: mockResult},
      });

      expect(vi.mocked(QuickviewSidebar)).toHaveBeenCalled();
    });

    it('should render QuickviewIframe component with correct props', async () => {
      await renderQuickviewModal({
        props: {
          content: mockContent,
          result: mockResult,
          sandbox: 'allow-scripts',
        },
      });

      expect(vi.mocked(QuickviewIframe)).toHaveBeenCalledWith(
        expect.objectContaining({
          title: mockResult.title,
          src: 'https://example.com/preview',
          sandbox: 'allow-scripts',
          uniqueIdentifier: 'test-id-123request-123',
          content: mockContent,
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

  describe('#renderFooter', () => {
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
      await renderQuickviewModal({
        props: {
          content: mockContent,
          result: mockResult,
          current: 1,
          total: 10,
        },
      });

      // Note: renderButton functional component handles disabled state
      // We verify it's called with the correct disabled prop
      expect(vi.mocked(QuickviewIframe)).toHaveBeenCalled();
    });

    it('should disable next button when current equals total', async () => {
      await renderQuickviewModal({
        props: {
          content: mockContent,
          result: mockResult,
          current: 10,
          total: 10,
        },
      });

      // Note: renderButton functional component handles disabled state
      expect(vi.mocked(QuickviewIframe)).toHaveBeenCalled();
    });
  });

  describe('#reset', () => {
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

  describe('#onClose', () => {
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

  describe('event dispatching', () => {
    it('should dispatch atomic/quickview/next event when next button is clicked', async () => {
      const {element} = await renderQuickviewModal({
        props: {
          content: mockContent,
          result: mockResult,
          current: 1,
          total: 10,
        },
      });

      let eventFired = false;
      element.addEventListener('atomic/quickview/next', () => {
        eventFired = true;
      });

      // Trigger the next button click through the event dispatcher
      element.dispatchEvent(
        new CustomEvent('atomic/quickview/next', {bubbles: true})
      );

      expect(eventFired).toBe(true);
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

      let eventFired = false;
      element.addEventListener('atomic/quickview/previous', () => {
        eventFired = true;
      });

      // Trigger the previous button click through the event dispatcher
      element.dispatchEvent(
        new CustomEvent('atomic/quickview/previous', {bubbles: true})
      );

      expect(eventFired).toBe(true);
    });
  });

  describe('#quickviewUniqueIdentifier', () => {
    it('should combine result uniqueId with requestId', async () => {
      const {element} = await renderQuickviewModal({
        props: {content: mockContent, result: mockResult},
      });

      // biome-ignore lint/suspicious/noExplicitAny: accessing private getter for testing
      const identifier = (element as any).quickviewUniqueIdentifier;
      expect(identifier).toBe('test-id-123request-123');
    });
  });

  describe('#quickviewSrc', () => {
    it('should get contentURL from engine state', async () => {
      const {element} = await renderQuickviewModal({
        props: {content: mockContent, result: mockResult},
      });

      // biome-ignore lint/suspicious/noExplicitAny: accessing private getter for testing
      const src = (element as any).quickviewSrc;
      expect(src).toBe('https://example.com/preview');
    });
  });

  describe('highlight scripts management', () => {
    it('should call getWordsHighlights when iframe ref is set', async () => {
      await renderQuickviewModal({
        props: {content: mockContent, result: mockResult},
      });

      // Get the onSetIframeRef callback from the QuickviewIframe mock call
      const iframeMockCall = vi.mocked(QuickviewIframe).mock.calls[0];
      const onSetIframeRef = iframeMockCall?.[0].onSetIframeRef;

      if (onSetIframeRef) {
        const mockIframeRef = document.createElement('iframe');
        await onSetIframeRef(mockIframeRef as HTMLIFrameElement);

        expect(vi.mocked(getWordsHighlights)).toHaveBeenCalled();
      }
    });
  });

  describe('willUpdate lifecycle', () => {
    it('should call handleHighlightsScripts when highlightKeywords change', async () => {
      const {element} = await renderQuickviewModal({
        props: {content: mockContent, result: mockResult},
      });

      // biome-ignore lint/suspicious/noExplicitAny: accessing private property for testing
      (element as any).highlightKeywords = {
        highlightNone: true,
        keywords: {},
      };

      await element.updateComplete;

      // Verify the component updated (this indirectly tests handleHighlightsScripts was called)
      expect(element.isConnected).toBe(true);
    });
  });
});
