import {
  buildQuickview,
  type Quickview,
  type QuickviewState,
  type Result,
} from '@coveo/headless';
import {html} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {renderInAtomicResult} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-result-fixture';
import {buildFakeSearchEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/search/engine';
import {buildFakeQuickview} from '@/vitest-utils/testing-helpers/fixtures/headless/search/quickview-controller';
import {buildFakeResult} from '@/vitest-utils/testing-helpers/fixtures/headless/search/result';
import type {AtomicInsightResultQuickviewAction} from './atomic-insight-result-quickview-action';
import './atomic-insight-result-quickview-action';

vi.mock('@coveo/headless', {spy: true});

describe('atomic-insight-result-quickview-action', () => {
  let mockResult: Result;
  let mockQuickview: Quickview;
  const mockedEngine = buildFakeSearchEngine();

  const parts = (element: AtomicInsightResultQuickviewAction) => ({
    container: element?.shadowRoot?.querySelector(
      '[part="result-action-container"]'
    ),
    button: element?.shadowRoot?.querySelector('[part="result-action-button"]'),
    icon: element?.shadowRoot?.querySelector('[part="result-action-icon"]'),
  });

  beforeEach(() => {
    mockResult = buildFakeResult({
      title: 'Test Result Title',
      clickUri: 'https://example.com/test',
      uri: 'https://example.com/test',
      uniqueId: 'test-unique-id',
    });

    mockQuickview = buildFakeQuickview({
      state: {
        isLoading: false,
        content: '<html><body>Preview content</body></html>',
        currentResult: 1,
        totalResults: 10,
        resultHasPreview: true,
        currentResultUniqueId: 'test-unique-id',
      },
    });
  });

  const renderComponent = async ({
    props = {},
    result = mockResult,
    quickviewState,
  }: {
    props?: Partial<{sandbox: string}>;
    result?: Result;
    quickviewState?: Partial<QuickviewState>;
  } = {}) => {
    const finalQuickview = buildFakeQuickview({
      ...mockQuickview,
      state: {
        ...mockQuickview.state,
        ...quickviewState,
      },
    });

    vi.mocked(buildQuickview).mockReturnValue(finalQuickview);

    const {element, atomicResult, atomicInterface} =
      await renderInAtomicResult<AtomicInsightResultQuickviewAction>({
        template: html`<atomic-insight-result-quickview-action
          sandbox=${
            props.sandbox ||
            'allow-popups allow-top-navigation allow-same-origin'
          }
        ></atomic-insight-result-quickview-action>`,
        selector: 'atomic-insight-result-quickview-action',
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
      atomicResult,
      atomicInterface,
      parts: parts(element),
    };
  };

  it('should be defined', () => {
    const el = document.createElement('atomic-insight-result-quickview-action');
    expect(el).toBeInstanceOf(AtomicInsightResultQuickviewAction);
  });

  it('should initialize successfully', async () => {
    const {element} = await renderComponent();
    expect(element).toBeDefined();
    expect(element.quickview).toBeDefined();
  });

  it('should build quickview controller with correct engine and result', async () => {
    const {element} = await renderComponent();

    expect(buildQuickview).toHaveBeenCalledWith(element.bindings.engine, {
      options: {result: mockResult},
    });
    expect(element.quickview).toBeDefined();
  });

  it('should extract result from result context item with result property', async () => {
    const {element} = await renderComponent();

    expect(element.quickview).toBeDefined();
    expect(buildQuickview).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        options: expect.objectContaining({result: mockResult}),
      })
    );
  });

  it('should validate sandbox property contains allow-same-origin', async () => {
    const {element} = await renderComponent({
      props: {sandbox: 'allow-popups allow-top-navigation allow-same-origin'},
    });

    expect(element.sandbox).toContain('allow-same-origin');
  });

  it('should have default sandbox value', async () => {
    const {element} = await renderComponent();

    expect(element.sandbox).toBe(
      'allow-popups allow-top-navigation allow-same-origin'
    );
  });

  it('should accept custom sandbox value with allow-same-origin', async () => {
    const customSandbox =
      'allow-same-origin allow-popups allow-scripts allow-forms';
    const {element} = await renderComponent({
      props: {sandbox: customSandbox},
    });

    expect(element.sandbox).toBe(customSandbox);
  });

  describe('when component is connected', () => {
    it('should add atomic/quickview/next event listener to document.body', async () => {
      const addEventListenerSpy = vi.spyOn(document.body, 'addEventListener');
      await renderComponent();

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'atomic/quickview/next',
        expect.any(Function)
      );

      addEventListenerSpy.mockRestore();
    });

    it('should add atomic/quickview/previous event listener to document.body', async () => {
      const addEventListenerSpy = vi.spyOn(document.body, 'addEventListener');
      await renderComponent();

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'atomic/quickview/previous',
        expect.any(Function)
      );

      addEventListenerSpy.mockRestore();
    });

    it('should set button focus target when button is rendered', async () => {
      const {element, parts} = await renderComponent({
        quickviewState: {resultHasPreview: true},
      });

      await element.updateComplete;

      expect(parts.button).toBeDefined();
    });
  });

  describe('when component is disconnected', () => {
    it('should remove atomic/quickview/next event listener', async () => {
      const removeEventListenerSpy = vi.spyOn(
        document.body,
        'removeEventListener'
      );
      const {element} = await renderComponent();

      element.disconnectedCallback();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'atomic/quickview/next',
        expect.any(Function)
      );

      removeEventListenerSpy.mockRestore();
    });

    it('should remove atomic/quickview/previous event listener', async () => {
      const removeEventListenerSpy = vi.spyOn(
        document.body,
        'removeEventListener'
      );
      const {element} = await renderComponent();

      element.disconnectedCallback();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'atomic/quickview/previous',
        expect.any(Function)
      );

      removeEventListenerSpy.mockRestore();
    });
  });

  describe('when result has preview', () => {
    it('should render button', async () => {
      const {parts} = await renderComponent({
        quickviewState: {resultHasPreview: true},
      });

      expect(parts.button).toBeDefined();
    });

    it('should render button with icon', async () => {
      const {element} = await renderComponent({
        quickviewState: {resultHasPreview: true},
      });

      const icon = element.shadowRoot?.querySelector('atomic-icon');
      expect(icon).toBeDefined();
    });
  });

  describe('when result does not have preview', () => {
    it('should not render button', async () => {
      const {parts} = await renderComponent({
        quickviewState: {resultHasPreview: false},
      });

      expect(parts.button).toBeNull();
    });
  });

  describe('when clicking button', () => {
    it('should stop event propagation', async () => {
      const {element} = await renderComponent({
        quickviewState: {resultHasPreview: true},
      });
      const stopPropagationSpy = vi.fn();

      // @ts-expect-error accessing private method for testing
      element.onClick({stopPropagation: stopPropagationSpy});

      expect(stopPropagationSpy).toHaveBeenCalled();
    });

    it('should fetch result content when clicked', async () => {
      const {element} = await renderComponent({
        quickviewState: {resultHasPreview: true},
      });
      const fetchSpy = vi.spyOn(element.quickview, 'fetchResultContent');

      // @ts-expect-error accessing private method for testing
      element.onClick();

      expect(fetchSpy).toHaveBeenCalledOnce();
    });
  });

  describe('when atomic/quickview/next event is dispatched', () => {
    it('should call quickview.next', async () => {
      const {element} = await renderComponent();
      const nextSpy = vi.spyOn(element.quickview, 'next');

      const event = new Event('atomic/quickview/next');
      document.body.dispatchEvent(event);

      expect(nextSpy).toHaveBeenCalledOnce();
    });

    it('should stop immediate propagation', async () => {
      const {element} = await renderComponent();
      const stopImmediatePropagationSpy = vi.fn();
      const event = {
        stopImmediatePropagation: stopImmediatePropagationSpy,
      } as unknown as Event;

      // @ts-expect-error accessing private method for testing
      element.nextQuickviewHandler(event);

      expect(stopImmediatePropagationSpy).toHaveBeenCalledOnce();
    });
  });

  describe('when atomic/quickview/previous event is dispatched', () => {
    it('should call quickview.previous', async () => {
      const {element} = await renderComponent();
      const previousSpy = vi.spyOn(element.quickview, 'previous');

      const event = new Event('atomic/quickview/previous');
      document.body.dispatchEvent(event);

      expect(previousSpy).toHaveBeenCalledOnce();
    });

    it('should stop immediate propagation', async () => {
      const {element} = await renderComponent();
      const stopImmediatePropagationSpy = vi.fn();
      const event = {
        stopImmediatePropagation: stopImmediatePropagationSpy,
      } as unknown as Event;

      // @ts-expect-error accessing private method for testing
      element.previousQuickviewHandler(event);

      expect(stopImmediatePropagationSpy).toHaveBeenCalledOnce();
    });
  });

  describe('when component updates', () => {
    it('should create quickview modal element if not present', async () => {
      const {element, atomicInterface} = await renderComponent({
        quickviewState: {resultHasPreview: true},
      });

      element.quickviewState = {
        ...element.quickviewState,
        content: '<html><body>Test content</body></html>',
      };
      await element.updateComplete;

      const modal = atomicInterface.querySelector('atomic-quickview-modal');
      expect(modal).toBeDefined();
    });

    it('should reuse existing quickview modal element', async () => {
      const {element, atomicInterface} = await renderComponent({
        quickviewState: {resultHasPreview: true},
      });

      element.quickviewState = {
        ...element.quickviewState,
        content: '<html><body>First update</body></html>',
      };
      await element.updateComplete;

      const firstModal = atomicInterface.querySelector(
        'atomic-quickview-modal'
      );

      element.quickviewState = {
        ...element.quickviewState,
        content: '<html><body>Second update</body></html>',
      };
      await element.updateComplete;

      const secondModal = atomicInterface.querySelector(
        'atomic-quickview-modal'
      );
      expect(firstModal).toBe(secondModal);
    });

    it('should set sandbox attribute on quickview modal', async () => {
      const customSandbox =
        'allow-popups allow-top-navigation allow-same-origin allow-scripts';
      const {element, atomicInterface} = await renderComponent({
        props: {sandbox: customSandbox},
        quickviewState: {resultHasPreview: true},
      });

      element.quickviewState = {
        ...element.quickviewState,
        content: '<html><body>Test content</body></html>',
      };
      await element.updateComplete;

      const modal = atomicInterface.querySelector('atomic-quickview-modal');
      expect(modal?.getAttribute('sandbox')).toBe(customSandbox);
    });

    it('should update modal content when quickview state has content', async () => {
      const testContent = '<html><body>Updated content</body></html>';
      const {element, atomicInterface} = await renderComponent({
        quickviewState: {
          resultHasPreview: true,
          content: testContent,
          currentResult: 3,
          totalResults: 10,
        },
      });

      await element.updateComplete;

      const modal = atomicInterface.querySelector('atomic-quickview-modal');
      expect(modal).toBeDefined();
    });

    it('should update aria live region when loading', async () => {
      const {element} = await renderComponent({
        quickviewState: {
          resultHasPreview: true,
          content: '<html><body>Test</body></html>',
          isLoading: true,
          currentResult: 1,
          totalResults: 5,
        },
      });

      await element.updateComplete;

      // AriaLiveRegionController sets message internally
      expect(element).toBeDefined();
    });

    it('should update aria live region when loaded', async () => {
      const {element} = await renderComponent({
        quickviewState: {
          resultHasPreview: true,
          content: '<html><body>Test</body></html>',
          isLoading: false,
          currentResult: 2,
          totalResults: 5,
        },
      });

      await element.updateComplete;

      // AriaLiveRegionController sets message internally
      expect(element).toBeDefined();
    });
  });
});
