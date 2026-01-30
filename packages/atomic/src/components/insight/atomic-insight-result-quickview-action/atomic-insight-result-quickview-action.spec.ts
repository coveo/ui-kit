import {
  buildQuickview,
  type FoldedResult as InsightFoldedResult,
  type Quickview,
  type QuickviewState,
  type Result,
} from '@coveo/headless/insight';
import {html} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {renderInAtomicInsightResult} from '@/vitest-utils/testing-helpers/fixtures/atomic/insight/atomic-insight-result-fixture';
import {buildFakeInsightEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/insight/engine';
import {buildFakeInsightResult} from '@/vitest-utils/testing-helpers/fixtures/headless/insight/result';
import type {AtomicInsightResultQuickviewAction} from './atomic-insight-result-quickview-action';
import './atomic-insight-result-quickview-action';

vi.mock('@coveo/headless/insight', {spy: true});

describe('atomic-insight-result-quickview-action', () => {
  let mockResult: Result;
  let mockFoldedResult: InsightFoldedResult;
  let mockQuickview: Quickview;
  const mockedEngine = buildFakeInsightEngine();

  const parts = (element: AtomicInsightResultQuickviewAction) => ({
    container: element?.querySelector('[part="result-action-container"]'),
    button: element?.querySelector('[part="result-action-button"]'),
    icon: element?.querySelector('[part="result-action-icon"]'),
  });

  const buildFakeInsightQuickview = ({
    state,
  }: {
    state?: Partial<QuickviewState>;
  } = {}) => {
    return {
      fetchResultContent: vi.fn(),
      state: {
        isLoading: false,
        contentURL: undefined,
        resultHasPreview: true,
        ...state,
      },
      subscribe: vi.fn((callback) => {
        callback();
        return vi.fn();
      }),
    } as unknown as Quickview;
  };

  beforeEach(() => {
    mockResult = buildFakeInsightResult({
      title: 'Test Result Title',
      clickUri: 'https://example.com/test',
      uri: 'https://example.com/test',
      uniqueId: 'test-unique-id',
    });

    mockFoldedResult = {
      result: mockResult,
      children: [],
    };

    mockQuickview = buildFakeInsightQuickview({
      state: {
        isLoading: false,
        contentURL: 'https://example.com/preview',
        resultHasPreview: true,
      },
    });
  });

  const renderComponent = async ({
    props = {},
    result = mockFoldedResult,
    quickviewState,
  }: {
    props?: Partial<{sandbox: string}>;
    result?: InsightFoldedResult;
    quickviewState?: Partial<QuickviewState>;
  } = {}) => {
    const finalQuickview = buildFakeInsightQuickview({
      state: {
        ...mockQuickview.state,
        ...quickviewState,
      },
    });

    vi.mocked(buildQuickview).mockReturnValue(finalQuickview);

    const {element, atomicResult, atomicInterface} =
      await renderInAtomicInsightResult<AtomicInsightResultQuickviewAction>({
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

  describe('when result has preview', () => {
    it('should render button', async () => {
      const {parts} = await renderComponent({
        quickviewState: {resultHasPreview: true},
      });

      expect(parts.button).toBeInTheDocument();
    });

    it('should render button with icon', async () => {
      const {element} = await renderComponent({
        quickviewState: {resultHasPreview: true},
      });

      const icon = element.querySelector('atomic-icon');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('when result does not have preview', () => {
    it('should not render button', async () => {
      const {parts} = await renderComponent({
        quickviewState: {resultHasPreview: false},
      });

      expect(parts.button).not.toBeInTheDocument();
    });
  });

  describe('when clicking button', () => {
    it('should stop event propagation', async () => {
      const {element} = await renderComponent({
        quickviewState: {resultHasPreview: true},
      });
      const stopPropagationSpy = vi.fn();

      element.onClick({stopPropagation: stopPropagationSpy});

      expect(stopPropagationSpy).toHaveBeenCalled();
    });

    it('should fetch result content when clicked', async () => {
      const {element} = await renderComponent({
        quickviewState: {resultHasPreview: true},
      });
      const fetchSpy = vi.spyOn(element.quickview, 'fetchResultContent');

      element.onClick();

      expect(fetchSpy).toHaveBeenCalledOnce();
    });
  });

  describe('when component updates', () => {
    it('should create quickview modal element if not present', async () => {
      const {element, atomicInterface} = await renderComponent({
        quickviewState: {resultHasPreview: true},
      });

      element.quickviewState = {
        ...element.quickviewState,
        contentURL: 'https://example.com/preview',
      };
      await element.updateComplete;

      const modal = atomicInterface.querySelector('atomic-quickview-modal');
      expect(modal).toBeInTheDocument();
    });

    it('should reuse existing quickview modal element', async () => {
      const {element, atomicInterface} = await renderComponent({
        quickviewState: {resultHasPreview: true},
      });

      element.quickviewState = {
        ...element.quickviewState,
        contentURL: 'https://example.com/preview1',
      };
      await element.updateComplete;

      const firstModal = atomicInterface.querySelector(
        'atomic-quickview-modal'
      );

      element.quickviewState = {
        ...element.quickviewState,
        contentURL: 'https://example.com/preview2',
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
        contentURL: 'https://example.com/preview',
      };
      await element.updateComplete;

      const modal = atomicInterface.querySelector('atomic-quickview-modal');
      expect(modal?.getAttribute('sandbox')).toBe(customSandbox);
    });

    it('should update modal content when quickview state has contentURL', async () => {
      const testContentURL = 'https://example.com/preview-content';
      const {element, atomicInterface} = await renderComponent({
        quickviewState: {
          resultHasPreview: true,
          contentURL: testContentURL,
        },
      });

      await element.updateComplete;

      const modal = atomicInterface.querySelector('atomic-quickview-modal');
      expect(modal).toBeInTheDocument();
    });
  });
});
