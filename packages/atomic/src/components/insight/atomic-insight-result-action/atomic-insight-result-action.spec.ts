import type {Result} from '@coveo/headless';
import {html} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {page, userEvent} from 'vitest/browser';
import {
  buildMockInsightFoldedResult,
  renderInAtomicInsightResult,
} from '@/vitest-utils/testing-helpers/fixtures/atomic/insight/atomic-insight-result-fixture';
import {buildFakeInsightEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/insight/engine';
import {mockConsole} from '@/vitest-utils/testing-helpers/testing-utils/mock-console';
import {
  Actions,
  type AtomicInsightResultAction,
  type InsightResultActionClickedEvent,
} from './atomic-insight-result-action';
import './atomic-insight-result-action';

vi.mock('@coveo/headless/insight', {spy: true});

describe('atomic-insight-result-action', () => {
  const mockedEngine = buildFakeInsightEngine();
  const writeTextMock = vi.fn();

  beforeEach(() => {
    mockConsole();
    Object.defineProperty(navigator, 'clipboard', {
      value: {writeText: writeTextMock},
      writable: true,
      configurable: true,
    });
    writeTextMock.mockClear();
  });

  const renderComponent = async (
    options: {
      result?: Result;
      icon?: string;
      tooltip?: string;
      tooltipOnClick?: string;
      action?: Actions | string;
    } = {}
  ) => {
    const {
      icon = '',
      tooltip = 'Test Tooltip',
      tooltipOnClick = '',
      action = '',
    } = options;

    const mockFoldedResult = buildMockInsightFoldedResult({
      uniqueId: 'test-result-id',
      title: 'Test Result',
    });

    const effectiveResult = options.result ?? mockFoldedResult.result;
    mockFoldedResult.result = effectiveResult;

    const template = html`
      <atomic-insight-result-action
        icon=${icon}
        tooltip=${tooltip}
        tooltip-on-click=${tooltipOnClick}
        action=${action}
      ></atomic-insight-result-action>
    `;

    const {element} =
      await renderInAtomicInsightResult<AtomicInsightResultAction>({
        template,
        selector: 'atomic-insight-result-action',
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

    it('should display the tooltip as title', async () => {
      const {button} = await renderComponent({tooltip: 'My Tooltip'});
      await expect.element(button).toHaveAttribute('title', 'My Tooltip');
    });
  });

  describe('when using default icons based on action type', () => {
    it('should display different icons for different action types', async () => {
      const {element: copyElement} = await renderComponent({
        action: Actions.CopyToClipboard,
      });
      const copyIcon = copyElement
        .querySelector('atomic-icon')
        ?.getAttribute('icon');

      const {element: attachElement} = await renderComponent({
        action: Actions.AttachToCase,
      });
      const attachIcon = attachElement
        .querySelector('atomic-icon')
        ?.getAttribute('icon');

      expect(copyIcon).toBeTruthy();
      expect(attachIcon).toBeTruthy();
      expect(copyIcon).not.toBe(attachIcon);
    });

    it('should use custom icon when provided', async () => {
      const customIcon = '<svg>custom</svg>';
      const {element} = await renderComponent({
        icon: customIcon,
        action: Actions.CopyToClipboard,
      });
      const iconElement = element.querySelector('atomic-icon');

      expect(iconElement?.getAttribute('icon')).toBe(customIcon);
    });
  });

  describe('when clicking the action button', () => {
    it('should emit atomicInsightResultActionClicked event', async () => {
      const {element, button} = await renderComponent({
        action: Actions.CopyToClipboard,
      });

      const eventPromise = new Promise<
        CustomEvent<InsightResultActionClickedEvent>
      >((resolve) => {
        element.addEventListener(
          'atomicInsightResultActionClicked',
          (e) => resolve(e as CustomEvent<InsightResultActionClickedEvent>),
          {once: true}
        );
      });

      await button.click();

      const event = await eventPromise;
      expect(event.detail.action).toBe(Actions.CopyToClipboard);
      expect(event.detail.result).toBeDefined();
      expect(event.bubbles).toBe(true);
      expect(event.composed).toBe(true);
      expect(event.cancelable).toBe(true);
    });

    it('should copy to clipboard when action is copyToClipboard', async () => {
      const {button} = await renderComponent({
        action: Actions.CopyToClipboard,
      });

      await button.click();

      expect(writeTextMock).toHaveBeenCalled();
    });

    it('should dispatch analytics action when action is copyToClipboard', async () => {
      const {button} = await renderComponent({
        action: Actions.CopyToClipboard,
      });

      await button.click();

      expect(mockedEngine.dispatch).toHaveBeenCalled();
    });

    it('should dispatch analytics action when action is postToFeed', async () => {
      const {button} = await renderComponent({action: Actions.PostToFeed});

      await button.click();

      expect(mockedEngine.dispatch).toHaveBeenCalled();
    });

    it('should dispatch analytics action when action is sendAsEmail', async () => {
      const {button} = await renderComponent({action: Actions.SendAsEmail});

      await button.click();

      expect(mockedEngine.dispatch).toHaveBeenCalled();
    });
  });

  describe('when using tooltipOnClick', () => {
    it('should temporarily show tooltipOnClick after clicking', async () => {
      vi.useFakeTimers();

      const {element, button} = await renderComponent({
        tooltip: 'Copy',
        tooltipOnClick: 'Copied!',
        action: Actions.CopyToClipboard,
      });

      await button.click();

      const buttonEl = element.querySelector('button');
      expect(buttonEl?.getAttribute('title')).toBe('Copied!');

      await vi.advanceTimersByTimeAsync(1000);

      expect(buttonEl?.getAttribute('title')).toBe('Copy');

      vi.useRealTimers();
    });
  });

  it('should emit event when activated via keyboard', async () => {
    const {element} = await renderComponent({action: Actions.CopyToClipboard});

    const eventPromise = new Promise<
      CustomEvent<InsightResultActionClickedEvent>
    >((resolve) => {
      element.addEventListener(
        'atomicInsightResultActionClicked',
        (e) => resolve(e as CustomEvent<InsightResultActionClickedEvent>),
        {once: true}
      );
    });

    element.querySelector('button')!.focus();
    await userEvent.keyboard('{Enter}');

    const event = await eventPromise;
    expect(event.detail.action).toBe(Actions.CopyToClipboard);
    expect(event.detail.result).toBeDefined();
  });
});
