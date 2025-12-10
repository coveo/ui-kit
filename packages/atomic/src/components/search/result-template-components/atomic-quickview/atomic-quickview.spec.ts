import type {Quickview, QuickviewState, Result} from '@coveo/headless';
import {buildQuickview} from '@coveo/headless';
import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type MockInstance,
  vi,
} from 'vitest';
import {page} from 'vitest/browser';
import {renderInAtomicResult} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-result-fixture';
import {buildFakeSearchEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/search/engine';
import {buildFakeQuickview} from '@/vitest-utils/testing-helpers/fixtures/headless/search/quickview';
import {buildFakeResult} from '@/vitest-utils/testing-helpers/fixtures/headless/search/result';
import {AtomicQuickview} from './atomic-quickview';
import './atomic-quickview';

vi.mock('@coveo/headless', {spy: true});

describe('atomic-quickview', () => {
  let mockResult: Result;
  let mockQuickview: Quickview;
  let consoleWarnSpy: MockInstance;
  const mockedEngine = buildFakeSearchEngine();

  const locators = {
    getButton: () => page.getByRole('button', {name: 'Quick View'}),
  };

  const parts = (element: AtomicQuickview) => ({
    button: element?.shadowRoot?.querySelector('[part="button"]'),
    icon: element?.shadowRoot?.querySelector('[part="icon"]'),
  });

  beforeEach(() => {
    mockResult = buildFakeResult({
      title: 'Test Result Title',
      clickUri: 'https://example.com/test',
      hasHtmlVersion: true,
    });

    mockQuickview = buildFakeQuickview({
      state: {
        isLoading: false,
        content: '<html><body>Test content</body></html>',
        currentResult: 1,
        totalResults: 10,
        resultHasPreview: true,
      },
    });

    vi.mocked(buildQuickview).mockReturnValue(mockQuickview);
  });

  afterEach(() => {
    consoleWarnSpy?.mockRestore();
  });

  const renderComponent = async ({
    props = {},
    result = mockResult,
    quickviewState = mockQuickview.state,
  }: {
    props?: Partial<{sandbox: string}>;
    result?: Result;
    quickviewState?: QuickviewState;
  } = {}) => {
    if (quickviewState) {
      mockQuickview = buildFakeQuickview({state: quickviewState});
      vi.mocked(buildQuickview).mockReturnValue(mockQuickview);
    }

    const {element, atomicInterface} =
      await renderInAtomicResult<AtomicQuickview>({
        template: html`<atomic-quickview
        sandbox=${ifDefined(props.sandbox)}
      ></atomic-quickview>`,
        selector: 'atomic-quickview',
        result,
        bindings: (bindings) => {
          bindings.engine = mockedEngine;
          return bindings;
        },
      });

    await atomicInterface.updateComplete;
    await element?.updateComplete;

    return {
      element,
      atomicInterface,
      button: locators.getButton(),
      parts: parts(element),
    };
  };

  describe('#initialize', () => {
    it('should be defined', () => {
      const el = document.createElement('atomic-quickview');
      expect(el).toBeInstanceOf(AtomicQuickview);
    });

    it('should initialize without error', async () => {
      const {element} = await renderComponent();
      expect(element.error).toBeNull();
    });

    it('should build quickview controller with result', async () => {
      await renderComponent();
      expect(buildQuickview).toHaveBeenCalledWith(mockedEngine, {
        options: {result: mockResult},
      });
    });

    it('should validate sandbox property with allow-same-origin', async () => {
      const {element} = await renderComponent({
        props: {sandbox: 'allow-popups allow-top-navigation allow-same-origin'},
      });
      expect(element.error).toBeNull();
    });

    describe('when sandbox property is invalid', () => {
      beforeEach(() => {
        consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      });

      it('should warn when sandbox does not include allow-same-origin', async () => {
        await renderComponent({
          props: {sandbox: 'allow-popups allow-top-navigation'},
        });
        expect(consoleWarnSpy).toHaveBeenCalled();
      });
    });
  });

  describe('#render', () => {
    it('should render button when result has preview', async () => {
      const {parts} = await renderComponent();
      await expect.element(parts.button).toBeInTheDocument();
    });

    it('should render icon in button', async () => {
      const {parts} = await renderComponent();
      await expect.element(parts.icon).toBeInTheDocument();
    });

    it('should not render button when result has no preview', async () => {
      const {parts} = await renderComponent({
        quickviewState: {
          isLoading: false,
          content: '',
          currentResult: 1,
          totalResults: 10,
          resultHasPreview: false,
        },
      });
      expect(parts.button).toBeNull();
    });

    it('should have correct title attribute', async () => {
      const {button} = await renderComponent();
      await expect.element(button).toHaveAttribute('title', 'Quick View');
    });
  });

  describe('#onClick', () => {
    it('should fetch result content when button is clicked', async () => {
      const {button} = await renderComponent();
      await button.click();
      expect(mockQuickview.fetchResultContent).toHaveBeenCalled();
    });

    it('should stop event propagation', async () => {
      const stopPropagationSpy = vi.fn();
      const {element} = await renderComponent();

      const button = element.shadowRoot?.querySelector('button');
      button?.addEventListener('click', (e) => {
        stopPropagationSpy();
        e.stopPropagation = stopPropagationSpy;
      });

      button?.click();

      expect(stopPropagationSpy).toHaveBeenCalled();
    });
  });

  describe('#updated lifecycle', () => {
    it('should add quickview modal to interface when component updates', async () => {
      const {atomicInterface, element} = await renderComponent();

      await element.updateComplete;

      const modal = atomicInterface.querySelector('atomic-quickview-modal');
      expect(modal).toBeTruthy();
    });

    it('should set sandbox attribute on modal', async () => {
      const sandbox =
        'allow-scripts allow-popups allow-top-navigation allow-same-origin';
      const {atomicInterface, element} = await renderComponent({
        props: {sandbox},
      });

      await element.updateComplete;

      const modal = atomicInterface.querySelector('atomic-quickview-modal');
      expect(modal?.getAttribute('sandbox')).toBe(sandbox);
    });

    it('should update modal content when quickview has content', async () => {
      const {atomicInterface, element} = await renderComponent();

      await element.updateComplete;

      const modal = atomicInterface.querySelector(
        'atomic-quickview-modal'
      ) as HTMLAtomicQuickviewModalElement;
      expect(modal.content).toBe(mockQuickview.state.content);
      expect(modal.result).toBe(mockResult);
      expect(modal.total).toBe(mockQuickview.state.totalResults);
      expect(modal.current).toBe(mockQuickview.state.currentResult);
    });
  });

  describe('#connectedCallback', () => {
    it('should add event listener for atomic/quickview/next', async () => {
      const {element} = await renderComponent();
      await element.updateComplete;

      const event = new CustomEvent('atomic/quickview/next', {bubbles: true});
      document.body.dispatchEvent(event);

      expect(mockQuickview.next).toHaveBeenCalled();
    });

    it('should add event listener for atomic/quickview/previous', async () => {
      const {element} = await renderComponent();
      await element.updateComplete;

      const event = new CustomEvent('atomic/quickview/previous', {
        bubbles: true,
      });
      document.body.dispatchEvent(event);

      expect(mockQuickview.previous).toHaveBeenCalled();
    });
  });

  describe('#disconnectedCallback', () => {
    it('should remove event listeners when disconnected', async () => {
      const {element} = await renderComponent();
      await element.updateComplete;

      element.remove();

      const nextEvent = new CustomEvent('atomic/quickview/next', {
        bubbles: true,
      });
      const prevEvent = new CustomEvent('atomic/quickview/previous', {
        bubbles: true,
      });

      document.body.dispatchEvent(nextEvent);
      document.body.dispatchEvent(prevEvent);

      // Should not be called after disconnect (already called during mount)
      expect(mockQuickview.next).toHaveBeenCalledTimes(0);
      expect(mockQuickview.previous).toHaveBeenCalledTimes(0);
    });
  });

  describe('aria-live region', () => {
    it('should update aria message when loading', async () => {
      const {element} = await renderComponent({
        quickviewState: {
          isLoading: true,
          content: '',
          currentResult: 1,
          totalResults: 10,
          resultHasPreview: true,
        },
      });

      await element.updateComplete;

      // The AriaLiveRegionController should dispatch the loading message
      expect(element.bindings.i18n.t).toHaveBeenCalledWith('quickview-loading');
    });

    it('should update aria message when loaded', async () => {
      const {element} = await renderComponent();

      await element.updateComplete;

      expect(element.bindings.i18n.t).toHaveBeenCalledWith('quickview-loaded', {
        first: mockQuickview.state.currentResult,
        last: mockQuickview.state.totalResults,
        title: mockResult.title,
      });
    });
  });
});
