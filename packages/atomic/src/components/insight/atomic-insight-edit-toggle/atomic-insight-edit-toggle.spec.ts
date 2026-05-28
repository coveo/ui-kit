import {html} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {page, userEvent} from 'vitest/browser';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import './atomic-insight-edit-toggle';
import type {AtomicInsightEditToggle} from './atomic-insight-edit-toggle';

describe('atomic-insight-edit-toggle', () => {
  const renderComponent = async ({
    clickCallback = vi.fn(),
    tooltip = '',
  } = {}) => {
    const element = await fixture<AtomicInsightEditToggle>(html`
      <atomic-insight-edit-toggle
        .clickCallback=${clickCallback}
        .tooltip=${tooltip}
      ></atomic-insight-edit-toggle>
    `);

    const button = page.getByRole('button', {name: 'Edit'});

    return {
      element,
      button,
    };
  };

  it('should render the edit button', async () => {
    const {button} = await renderComponent();
    await expect.element(button).toBeInTheDocument();
  });

  it('should call clickCallback when button is clicked', async () => {
    const clickCallback = vi.fn();
    const {button} = await renderComponent({clickCallback});

    await button.click();

    expect(clickCallback).toHaveBeenCalledOnce();
  });

  it('should render tooltip semantics when focused', async () => {
    const tooltip = 'Edit this item';
    const {button, element} = await renderComponent({tooltip});

    await button.focus();

    await expect.element(button).toHaveAttribute('aria-describedby');
    const tooltipId = await button.getAttribute('aria-describedby');
    const tooltipElement = element.shadowRoot?.getElementById(tooltipId!);
    expect(tooltipElement).toHaveAttribute('role', 'tooltip');
    expect(tooltipElement).not.toHaveAttribute('hidden');
  });

  it('should have correct aria-label', async () => {
    const {button} = await renderComponent();
    await expect.element(button).toHaveAttribute('aria-label', 'Edit');
  });

  it('should dismiss tooltip on Escape and keep focus on trigger', async () => {
    const {button, element} = await renderComponent({
      tooltip: 'Edit this item',
    });
    await button.focus();
    const tooltipId = await button.getAttribute('aria-describedby');
    const tooltipElement = element.shadowRoot?.getElementById(tooltipId!);

    await userEvent.keyboard('{Escape}');

    expect(tooltipElement).toHaveAttribute('hidden');
    await expect.element(button).toHaveFocus();
  });
});
