import type {Result as InsightResult} from '@coveo/headless/insight';
import {html} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {page} from 'vitest/browser';
import {
  buildMockInsightFoldedResult,
  renderInAtomicInsightResult,
} from '@/vitest-utils/testing-helpers/fixtures/atomic/insight/atomic-insight-result-fixture';
import {buildFakeInsightEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/insight/engine';
import {mockConsole} from '@/vitest-utils/testing-helpers/testing-utils/mock-console';
import type {
  AtomicInsightResultAttachToCaseAction,
  InsightResultAttachToCaseEvent,
} from './atomic-insight-result-attach-to-case-action';
import './atomic-insight-result-attach-to-case-action';

vi.mock('@coveo/headless/insight', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@coveo/headless/insight')>();
  return {
    ...actual,
    buildAttachToCase: vi.fn(() => ({
      subscribe: vi.fn((cb: () => void) => {
        cb();
        return () => {};
      }),
      state: {},
      isAttached: vi.fn(() => false),
      attach: vi.fn(),
      detach: vi.fn(),
    })),
  };
});

describe('atomic-insight-result-attach-to-case-action', () => {
  const mockedEngine = buildFakeInsightEngine();
  let mockAttachToCase: {
    isAttached: ReturnType<typeof vi.fn>;
    attach: ReturnType<typeof vi.fn>;
    detach: ReturnType<typeof vi.fn>;
    subscribe: ReturnType<typeof vi.fn>;
    state: Record<string, unknown>;
  };

  beforeEach(async () => {
    mockConsole();

    mockAttachToCase = {
      subscribe: vi.fn((cb: () => void) => {
        cb();
        return () => {};
      }),
      state: {},
      isAttached: vi.fn(() => false),
      attach: vi.fn(),
      detach: vi.fn(),
    };

    const headless = await import('@coveo/headless/insight');
    vi.mocked(headless.buildAttachToCase).mockReturnValue(
      mockAttachToCase as unknown as ReturnType<
        typeof headless.buildAttachToCase
      >
    );
  });

  interface RenderOptions {
    result?: InsightResult;
    isAttached?: boolean;
  }

  const renderComponent = async ({
    result,
    isAttached = false,
  }: RenderOptions = {}) => {
    const mockFoldedResult = buildMockInsightFoldedResult({
      uniqueId: 'test-result-id',
      title: 'Test Result',
    });

    const effectiveResult = result ?? mockFoldedResult.result;
    mockFoldedResult.result = effectiveResult;

    mockAttachToCase.isAttached.mockReturnValue(isAttached);

    const {element} =
      await renderInAtomicInsightResult<AtomicInsightResultAttachToCaseAction>({
        template: html`<atomic-insight-result-attach-to-case-action></atomic-insight-result-attach-to-case-action>`,
        selector: 'atomic-insight-result-attach-to-case-action',
        result: mockFoldedResult,
        bindings: (bindings) => {
          bindings.engine = mockedEngine;
          return bindings;
        },
      });

    return {
      element,
      button: page.getByRole('button'),
      parts: {
        container: element.shadowRoot?.querySelector(
          '[part="result-action-container"]'
        ),
        button: element.shadowRoot?.querySelector(
          '[part="result-action-button"]'
        ),
        icon: element.shadowRoot?.querySelector('[part="result-action-icon"]'),
      },
    };
  };

  describe('rendering', () => {
    it('should render the action button', async () => {
      const {button} = await renderComponent();
      await expect.element(button).toBeInTheDocument();
    });

    it('should render all shadow parts', async () => {
      const {parts} = await renderComponent();
      expect(parts.container).toBeTruthy();
      expect(parts.button).toBeTruthy();
      expect(parts.icon).toBeTruthy();
    });

    it('should have appropriate role', async () => {
      const {button} = await renderComponent();
      await expect.element(button).toHaveRole('button');
    });
  });

  describe('when not attached', () => {
    it('should have attach-to-case as title', async () => {
      const {button} = await renderComponent({isAttached: false});
      await expect.element(button).toHaveAttribute('title', 'attach-to-case');
    });

    it('should have attach-to-case as aria-label', async () => {
      const {button} = await renderComponent({isAttached: false});
      await expect
        .element(button)
        .toHaveAttribute('aria-label', 'attach-to-case');
    });

    it('should emit atomic/insight/attachToCase/attach event when clicked', async () => {
      const {element, button} = await renderComponent({isAttached: false});

      const eventPromise = new Promise<
        CustomEvent<InsightResultAttachToCaseEvent>
      >((resolve) => {
        element.addEventListener(
          'atomic/insight/attachToCase/attach',
          (e) => resolve(e as CustomEvent<InsightResultAttachToCaseEvent>),
          {once: true}
        );
      });

      await button.click();

      const event = await eventPromise;
      expect(event.detail.callback).toBe(mockAttachToCase.attach);
      expect(event.detail.result).toBeDefined();
      expect(event.bubbles).toBe(true);
      expect(event.composed).toBe(true);
      expect(event.cancelable).toBe(true);
    });
  });

  describe('when attached', () => {
    it('should have detach-from-case as title', async () => {
      const {button} = await renderComponent({isAttached: true});
      await expect.element(button).toHaveAttribute('title', 'detach-from-case');
    });

    it('should have detach-from-case as aria-label', async () => {
      const {button} = await renderComponent({isAttached: true});
      await expect
        .element(button)
        .toHaveAttribute('aria-label', 'detach-from-case');
    });

    it('should emit atomic/insight/attachToCase/detach event when clicked', async () => {
      const {element, button} = await renderComponent({isAttached: true});

      const eventPromise = new Promise<
        CustomEvent<InsightResultAttachToCaseEvent>
      >((resolve) => {
        element.addEventListener(
          'atomic/insight/attachToCase/detach',
          (e) => resolve(e as CustomEvent<InsightResultAttachToCaseEvent>),
          {once: true}
        );
      });

      await button.click();

      const event = await eventPromise;
      expect(event.detail.callback).toBe(mockAttachToCase.detach);
      expect(event.detail.result).toBeDefined();
      expect(event.bubbles).toBe(true);
      expect(event.composed).toBe(true);
      expect(event.cancelable).toBe(true);
    });
  });

  describe('accessibility', () => {
    it('should be keyboard accessible', async () => {
      const {button} = await renderComponent();
      await expect.element(button).toBeEnabled();
    });
  });
});
