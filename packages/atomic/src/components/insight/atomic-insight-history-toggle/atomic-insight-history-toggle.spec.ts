import {html} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {page} from 'vitest/browser';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import type {AtomicInsightHistoryToggle} from './atomic-insight-history-toggle';
import './atomic-insight-history-toggle';

describe('atomic-insight-history-toggle', () => {
  let element: AtomicInsightHistoryToggle;

  const renderComponent = async ({
    clickCallback = () => {},
    tooltip = '',
  }: {
    clickCallback?: () => void;
    tooltip?: string;
  } = {}) => {
    element = await fixture<AtomicInsightHistoryToggle>(
      html`<atomic-insight-history-toggle
        .clickCallback=${clickCallback}
        .tooltip=${tooltip}
      ></atomic-insight-history-toggle>`
    );

    await element.updateComplete;

    return {
      element,
      button: page.getByRole('button'),
      parts: {
        container: element.shadowRoot?.querySelector(
          '[part="insight-history-toggle-container"]'
        ),
        button: element.shadowRoot?.querySelector(
          '[part="insight-history-toggle-button"]'
        ),
        icon: element.shadowRoot?.querySelector(
          '[part="insight-history-toggle-icon"]'
        ),
      },
    };
  };

  describe('rendering', () => {
    it('should render the history toggle button', async () => {
      const {button} = await renderComponent();
      await expect.element(button).toBeInTheDocument();
    });

    it('should render all shadow parts', async () => {
      const {parts} = await renderComponent();
      expect(parts.container).toBeTruthy();
      expect(parts.button).toBeTruthy();
      expect(parts.icon).toBeTruthy();
    });

    it('should have aria-label set to "history"', async () => {
      const {button} = await renderComponent();
      await expect.element(button).toHaveAttribute('aria-label', 'history');
    });
  });

  describe('tooltip property', () => {
    it('should have an empty title attribute when tooltip is empty', async () => {
      const {button} = await renderComponent({tooltip: ''});
      await expect.element(button).toHaveAttribute('title', '');
    });

    it('should have a title attribute when tooltip is provided', async () => {
      const {button} = await renderComponent({
        tooltip: 'View history',
      });
      await expect.element(button).toHaveAttribute('title', 'View history');
    });

    it('should update title when tooltip changes', async () => {
      const {element, button} = await renderComponent({
        tooltip: 'Initial tooltip',
      });

      await expect.element(button).toHaveAttribute('title', 'Initial tooltip');

      element.tooltip = 'Updated tooltip';
      await element.updateComplete;

      await expect.element(button).toHaveAttribute('title', 'Updated tooltip');
    });
  });

  describe('clickCallback property', () => {
    it('should call clickCallback when button is clicked', async () => {
      const clickCallback = vi.fn();
      const {button} = await renderComponent({clickCallback});

      await button.click();

      expect(clickCallback).toHaveBeenCalledOnce();
    });

    it('should not throw error when clickCallback is not provided', async () => {
      const {button} = await renderComponent();

      await expect(button.click()).resolves.not.toThrow();
    });

    it('should call updated clickCallback after property change', async () => {
      const firstCallback = vi.fn();
      const secondCallback = vi.fn();

      const {element, button} = await renderComponent({
        clickCallback: firstCallback,
      });

      await button.click();
      expect(firstCallback).toHaveBeenCalledOnce();
      expect(secondCallback).not.toHaveBeenCalled();

      element.clickCallback = secondCallback;
      await element.updateComplete;

      await button.click();
      expect(firstCallback).toHaveBeenCalledOnce();
      expect(secondCallback).toHaveBeenCalledOnce();
    });
  });

  describe('accessibility', () => {
    it('should be keyboard accessible', async () => {
      const {button} = await renderComponent();
      await expect.element(button).toBeEnabled();
    });

    it('should have appropriate role', async () => {
      const {button} = await renderComponent();
      await expect.element(button).toHaveRole('button');
    });
  });
});
