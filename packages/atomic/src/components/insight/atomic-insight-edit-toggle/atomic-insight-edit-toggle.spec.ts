import {html} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {page} from 'vitest/browser';
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

  it('should apply tooltip to button', async () => {
    const tooltip = 'Edit this item';
    const {button} = await renderComponent({tooltip});

    await expect.element(button).toHaveAttribute('title', tooltip);
  });

  it('should have correct aria-label', async () => {
    const {button} = await renderComponent();
    await expect.element(button).toHaveAttribute('aria-label', 'Edit');
  });

  it('should render with default empty tooltip', async () => {
    const {button} = await renderComponent();
    await expect.element(button).toHaveAttribute('title', '');
  });
});
