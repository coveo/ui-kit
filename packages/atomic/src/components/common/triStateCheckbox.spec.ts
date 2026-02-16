import {html} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {page} from 'vitest/browser';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {
  renderTriStateCheckbox,
  type TriStateCheckboxProps,
} from './triStateCheckbox';

describe('#renderTriStateCheckbox', () => {
  const defaultProps: TriStateCheckboxProps = {
    state: 'idle',
    text: 'Test Checkbox',
    onToggle: vi.fn(),
    onMouseDown: vi.fn(),
    id: 'test-checkbox',
    ariaLabel: 'Test Checkbox',
    part: 'checkbox',
    class: 'custom-class',
  };

  const renderComponent = (props: Partial<TriStateCheckboxProps> = {}) => {
    const mergedProps = {...defaultProps, ...props};
    return renderFunctionFixture(
      html`${renderTriStateCheckbox({props: mergedProps})}`
    );
  };

  it('renders the checkbox with default state', async () => {
    await renderComponent();
    const button = page.getByRole('button', {pressed: false});
    await expect.element(button).toBeInTheDocument();
  });

  it('renders the checkbox in "selected" state', async () => {
    await renderComponent({state: 'selected'});
    const button = page.getByRole('button', {pressed: true});
    await expect.element(button).toBeInTheDocument();
  });

  it('renders the checkbox in "excluded" state', async () => {
    await renderComponent({state: 'excluded'});
    // @ts-expect-error: mixed is a valid value for aria-pressed
    const button = page.getByRole('button', {pressed: 'mixed'});
    await expect.element(button).toBeInTheDocument();
  });

  it('calls the onToggle callback when clicked', async () => {
    const onToggleMock = vi.fn();
    await renderComponent({
      onToggle: onToggleMock,
      state: 'idle',
    });
    const button = page.getByRole('button').element();
    button?.dispatchEvent(new MouseEvent('click'));
    expect(onToggleMock).toHaveBeenCalledWith(true);
  });

  it('calls the onMouseDown callback when mouse down event occurs', async () => {
    const onMouseDownMock = vi.fn();
    renderComponent({onMouseDown: onMouseDownMock});

    const button = page.getByRole('button').element();
    button?.dispatchEvent(new MouseEvent('mousedown'));
    expect(onMouseDownMock).toHaveBeenCalled();
  });

  it('applies custom classes and attributes', async () => {
    await renderComponent({
      class: 'custom-class',
      id: 'custom-id',
      ariaLabel: 'Custom Label',
    });
    const button = page.getByRole('button');
    await expect.element(button).toHaveClass('custom-class');
    await expect.element(button).toHaveAttribute('id', 'custom-id');
    await expect.element(button).toHaveAttribute('aria-label', 'Custom Label');
  });

  it('renders the correct icon for "selected" state', async () => {
    const container = await renderComponent({state: 'selected'});
    const icon = container.querySelector('atomic-icon');
    await expect.element(icon).toBeVisible();
    expect(icon?.getAttribute('icon')).toMatchSnapshot();
  });

  it('renders the correct icon for "excluded" state', async () => {
    const container = await renderComponent({state: 'excluded'});
    const icon = container.querySelector('atomic-icon');
    await expect.element(icon).toBeVisible();
    expect(icon?.getAttribute('icon')).toMatchSnapshot();
  });

  it('hides the icon when the state is "idle"', async () => {
    const container = await renderComponent({state: 'idle'});
    const icon = container.querySelector('atomic-icon');
    await expect.element(icon).not.toBeVisible();
  });
});
