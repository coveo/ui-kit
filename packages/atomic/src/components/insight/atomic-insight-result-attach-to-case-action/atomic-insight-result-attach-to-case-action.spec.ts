import type {
  AttachedResults,
  AttachedResultsState,
  Result as InsightResult,
} from '@coveo/headless/insight';
import {html} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {page, userEvent} from 'vitest/browser';
import {
  buildMockInsightFoldedResult,
  renderInAtomicInsightResult,
} from '@/vitest-utils/testing-helpers/fixtures/atomic/insight/atomic-insight-result-fixture';
import {buildFakeAttachedResults} from '@/vitest-utils/testing-helpers/fixtures/headless/insight/attached-results-controller';
import {buildFakeInsightEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/insight/engine';
import {mockConsole} from '@/vitest-utils/testing-helpers/testing-utils/mock-console';
import type {
  AtomicInsightResultAttachToCaseAction,
  InsightResultAttachToCaseEvent,
} from './atomic-insight-result-attach-to-case-action';
import './atomic-insight-result-attach-to-case-action';

vi.mock('@coveo/headless/insight', {spy: true});

describe('atomic-insight-result-attach-to-case-action', () => {
  const mockedEngine = buildFakeInsightEngine();
  let mockedAttachedResults: AttachedResults;

  beforeEach(() => {
    mockConsole();
  });

  const renderComponent = async (
    options: {
      result?: InsightResult;
      isAttached?: boolean;
      attachedResultsState?: Partial<AttachedResultsState>;
    } = {}
  ) => {
    const {isAttached = false, attachedResultsState} = options;

    mockedAttachedResults = buildFakeAttachedResults({
      state: attachedResultsState,
      implementation: {
        isAttached: vi.fn(() => isAttached),
      },
    });

    const headless = await import('@coveo/headless/insight');
    vi.mocked(headless.buildAttachedResults).mockReturnValue(
      mockedAttachedResults
    );

    const mockFoldedResult = buildMockInsightFoldedResult({
      uniqueId: 'test-result-id',
      title: 'Test Result',
    });

    const effectiveResult = options.result ?? mockFoldedResult.result;
    mockFoldedResult.result = effectiveResult;

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
        container: element.querySelector('[part="result-action-container"]'),
        button: element.querySelector('[part="result-action-button"]'),
        icon: element.querySelector('[part="result-action-icon"]'),
      },
    };
  };

  describe('when initializing (#initialize)', () => {
    it('should build attached results controller with engine', async () => {
      const headless = await import('@coveo/headless/insight');
      const {element} = await renderComponent();

      expect(headless.buildAttachedResults).toHaveBeenCalledWith(
        mockedEngine,
        expect.objectContaining({
          options: expect.objectContaining({caseId: expect.any(String)}),
        })
      );
      expect(element.attachedResults).toBe(mockedAttachedResults);
    });
  });

  describe('when rendering (#render)', () => {
    it('should render all exposed parts', async () => {
      const {element} = await renderComponent();

      const expectedParts = [
        'result-action-container',
        'result-action-button',
        'result-action-icon',
      ];

      for (const part of expectedParts) {
        expect(
          element.querySelector(`[part="${part}"]`),
          `Part "${part}" should be in document`
        ).toBeInTheDocument();
      }
    });

    it('should render the action button', async () => {
      const {button} = await renderComponent();
      await expect.element(button).toBeInTheDocument();
    });

    it('should display different icons for attached and detached states', async () => {
      const {element: detachedElement} = await renderComponent({
        isAttached: false,
      });
      const detachedIcon = detachedElement
        .querySelector('atomic-icon')
        ?.getAttribute('icon');

      const {element: attachedElement} = await renderComponent({
        isAttached: true,
      });
      const attachedIcon = attachedElement
        .querySelector('atomic-icon')
        ?.getAttribute('icon');

      expect(detachedIcon).toBeTruthy();
      expect(attachedIcon).toBeTruthy();
      expect(detachedIcon).not.toBe(attachedIcon);
    });
  });

  describe('when not attached', () => {
    it('should have "Attach to case" as title', async () => {
      const {button} = await renderComponent({isAttached: false});
      await expect.element(button).toHaveAttribute('title', 'Attach to case');
    });

    it('should have "Attach to case" as aria-label', async () => {
      const {button} = await renderComponent({isAttached: false});
      await expect
        .element(button)
        .toHaveAttribute('aria-label', 'Attach to case');
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
      expect(event.detail.callback).toBeInstanceOf(Function);
      expect(event.detail.result).toBeDefined();
      expect(event.bubbles).toBe(true);
      expect(event.composed).toBe(true);
      expect(event.cancelable).toBe(true);

      // Verify that calling the callback invokes attach with the result
      event.detail.callback();
      expect(mockedAttachedResults.attach).toHaveBeenCalledWith(
        event.detail.result
      );
    });
  });

  describe('when attached', () => {
    it('should have "Detach from case" as title', async () => {
      const {button} = await renderComponent({isAttached: true});
      await expect.element(button).toHaveAttribute('title', 'Detach from case');
    });

    it('should have "Detach from case" as aria-label', async () => {
      const {button} = await renderComponent({isAttached: true});
      await expect
        .element(button)
        .toHaveAttribute('aria-label', 'Detach from case');
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
      expect(event.detail.callback).toBeInstanceOf(Function);
      expect(event.detail.result).toBeDefined();
      expect(event.bubbles).toBe(true);
      expect(event.composed).toBe(true);
      expect(event.cancelable).toBe(true);

      // Verify that calling the callback invokes detach with the result
      event.detail.callback();
      expect(mockedAttachedResults.detach).toHaveBeenCalledWith(
        event.detail.result
      );
    });
  });

  it('should emit event when activated via keyboard', async () => {
    const {element} = await renderComponent({isAttached: false});

    const eventPromise = new Promise<
      CustomEvent<InsightResultAttachToCaseEvent>
    >((resolve) => {
      element.addEventListener(
        'atomic/insight/attachToCase/attach',
        (e) => resolve(e as CustomEvent<InsightResultAttachToCaseEvent>),
        {once: true}
      );
    });

    element.querySelector('button')!.focus();
    await userEvent.keyboard('{Enter}');

    const event = await eventPromise;
    expect(event.detail.callback).toBeInstanceOf(Function);
    expect(event.detail.result).toBeDefined();
  });
});
