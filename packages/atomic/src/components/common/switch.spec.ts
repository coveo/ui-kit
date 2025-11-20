import {html, render} from 'lit';
import {fireEvent, within} from 'storybook/test';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {renderSwitch, type SwitchProps} from './switch';

describe('renderSwitch', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  const renderSwitchComponent = (
    props: Partial<SwitchProps>
  ): HTMLButtonElement => {
    render(
      html`${renderSwitch({
        props: {
          ...props,
          checked: props.checked ?? false,
          withToggle: props.withToggle ?? true, // Default to visible for testing
        },
      })}`,
      container
    );
    return within(container).getByRole('switch') as HTMLButtonElement;
  };

  it('should render a switch in the document', () => {
    const button = renderSwitchComponent({});
    expect(button).toBeInTheDocument();
  });

  it('should have role="switch"', () => {
    const button = renderSwitchComponent({});
    expect(button.getAttribute('role')).toBe('switch');
  });

  it('should set aria-checked to "false" when unchecked', () => {
    const button = renderSwitchComponent({checked: false});
    expect(button.getAttribute('aria-checked')).toBe('false');
  });

  it('should set aria-checked to "true" when checked', () => {
    const button = renderSwitchComponent({checked: true});
    expect(button.getAttribute('aria-checked')).toBe('true');
  });

  it('should apply bg-neutral class to container when unchecked', () => {
    const button = renderSwitchComponent({checked: false});
    const container = button.querySelector('div');
    expect(container).toHaveClass('bg-neutral');
    expect(container).not.toHaveClass('bg-primary');
  });

  it('should apply bg-primary class to container when checked', () => {
    const button = renderSwitchComponent({checked: true});
    const container = button.querySelector('div');
    expect(container).toHaveClass('bg-primary');
    expect(container).not.toHaveClass('bg-neutral');
  });

  it('should apply ml-6 class to handle when checked', () => {
    const button = renderSwitchComponent({checked: true});
    const handle = button.querySelector('div > div');
    expect(handle).toHaveClass('ml-6');
  });

  it('should not apply ml-6 class to handle when unchecked', () => {
    const button = renderSwitchComponent({checked: false});
    const handle = button.querySelector('div > div');
    expect(handle).not.toHaveClass('ml-6');
  });

  it('should show switch when withToggle is true', () => {
    const button = renderSwitchComponent({withToggle: true});
    expect(button).toHaveClass('flex');
    expect(button).not.toHaveClass('hidden');
  });

  it('should hide switch when withToggle is false', () => {
    render(
      html`${renderSwitch({
        props: {
          withToggle: false,
        },
      })}`,
      container
    );
    const button = within(container).getByRole('switch', {
      hidden: true,
    }) as HTMLButtonElement;
    expect(button).toHaveClass('hidden');
    expect(button).not.toHaveClass('flex');
  });

  it('should call onToggle with true when unchecked switch is clicked', async () => {
    const onToggle = vi.fn();
    const button = renderSwitchComponent({
      checked: false,
      onToggle,
    });

    await fireEvent.click(button);

    expect(onToggle).toHaveBeenCalledWith(true);
  });

  it('should call onToggle with false when checked switch is clicked', async () => {
    const onToggle = vi.fn();
    const button = renderSwitchComponent({
      checked: true,
      onToggle,
    });

    await fireEvent.click(button);

    expect(onToggle).toHaveBeenCalledWith(false);
  });

  it('should not call onToggle when it is undefined', async () => {
    const button = renderSwitchComponent({checked: false});

    // Should not throw
    await fireEvent.click(button);
    // If we got here, it didn't throw
    expect(true).toBe(true);
  });

  it('should apply ariaLabel attribute', () => {
    const button = renderSwitchComponent({ariaLabel: 'Toggle setting'});
    expect(button.getAttribute('aria-label')).toBe('Toggle setting');
  });

  it('should apply part attribute', () => {
    const button = renderSwitchComponent({part: 'toggle'});
    expect(button.getAttribute('part')).toBe('toggle');
  });

  it('should apply tabIndex attribute', () => {
    const button = renderSwitchComponent({tabIndex: 0});
    expect(button.getAttribute('tabindex')).toBe('0');
  });

  it('should apply title attribute', () => {
    const button = renderSwitchComponent({title: 'Toggle tooltip'});
    expect(button.getAttribute('title')).toBe('Toggle tooltip');
  });

  it('should have all base container classes', () => {
    const button = renderSwitchComponent({});
    const container = button.querySelector('div');
    expect(container).toHaveClass('w-12', 'h-6', 'p-1', 'rounded-full');
  });

  it('should have all base handle classes', () => {
    const button = renderSwitchComponent({});
    const handle = button.querySelector('div > div');
    expect(handle).toHaveClass('w-4', 'h-4', 'rounded-full', 'bg-white');
  });

  it('should have all base button classes', () => {
    const button = renderSwitchComponent({});
    expect(button).toHaveClass('rounded-full', 'btn-outline-neutral');
  });
});
