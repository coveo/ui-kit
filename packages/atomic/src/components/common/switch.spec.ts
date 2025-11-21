import {html} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {renderSwitch, type SwitchProps} from './switch';

describe('#renderSwitch', () => {
  const locators = (element: Element) => ({
    get button() {
      return element.querySelector(
        'button[role="switch"]'
      ) as HTMLButtonElement;
    },
    get container() {
      return element.querySelector('button > div');
    },
    get handle() {
      return element.querySelector('button > div > div');
    },
  });

  const renderComponent = async (props: Partial<SwitchProps> = {}) => {
    return await renderFunctionFixture(
      html`${renderSwitch({
        props: {
          checked: false,
          onToggle: vi.fn(),
          withToggle: true,
          ariaLabel: '',
          part: '',
          tabIndex: 0,
          title: '',
          ...props,
        },
      })}`
    );
  };

  it('should render a switch in the document', async () => {
    const element = await renderComponent();
    expect(element).toBeDefined();
  });

  it('should have role="switch"', async () => {
    const element = await renderComponent();
    const button = locators(element).button;
    expect(button).toHaveAttribute('role', 'switch');
  });

  it('should set aria-checked to "false" when unchecked', async () => {
    const element = await renderComponent({checked: false});
    const button = locators(element).button;
    expect(button).toHaveAttribute('aria-checked', 'false');
  });

  it('should set aria-checked to "true" when checked', async () => {
    const element = await renderComponent({checked: true});
    const button = locators(element).button;
    expect(button).toHaveAttribute('aria-checked', 'true');
  });

  it('should apply bg-neutral class to container when unchecked', async () => {
    const element = await renderComponent({checked: false});
    const container = locators(element).container;
    expect(container).toHaveClass('bg-neutral');
    expect(container).not.toHaveClass('bg-primary');
  });

  it('should apply bg-primary class to container when checked', async () => {
    const element = await renderComponent({checked: true});
    const container = locators(element).container;
    expect(container).toHaveClass('bg-primary');
    expect(container).not.toHaveClass('bg-neutral');
  });

  it('should apply ml-6 class to handle when checked', async () => {
    const element = await renderComponent({checked: true});
    const handle = locators(element).handle;
    expect(handle).toHaveClass('ml-6');
  });

  it('should not apply ml-6 class to handle when unchecked', async () => {
    const element = await renderComponent({checked: false});
    const handle = locators(element).handle;
    expect(handle).not.toHaveClass('ml-6');
  });

  it('should show switch when withToggle is true', async () => {
    const element = await renderComponent({withToggle: true});
    const button = locators(element).button;
    expect(button).toHaveClass('flex');
    expect(button).not.toHaveClass('hidden');
  });

  it('should hide switch when withToggle is false', async () => {
    const element = await renderComponent({withToggle: false});
    const button = locators(element).button;
    expect(button).toHaveClass('hidden');
    expect(button).not.toHaveClass('flex');
  });

  it('should call onToggle with true when unchecked switch is clicked', async () => {
    const onToggle = vi.fn();
    const element = await renderComponent({
      checked: false,
      onToggle,
    });
    const button = locators(element).button;

    button.click();

    expect(onToggle).toHaveBeenCalledWith(true);
  });

  it('should call onToggle with false when checked switch is clicked', async () => {
    const onToggle = vi.fn();
    const element = await renderComponent({
      checked: true,
      onToggle,
    });
    const button = locators(element).button;

    button.click();

    expect(onToggle).toHaveBeenCalledWith(false);
  });

  it('should apply ariaLabel attribute', async () => {
    const element = await renderComponent({ariaLabel: 'Toggle setting'});
    const button = locators(element).button;
    expect(button).toHaveAttribute('aria-label', 'Toggle setting');
  });

  it('should apply part attribute', async () => {
    const element = await renderComponent({part: 'toggle'});
    const button = locators(element).button;
    expect(button).toHaveAttribute('part', 'toggle');
  });

  it('should apply tabIndex attribute', async () => {
    const element = await renderComponent({tabIndex: 0});
    const button = locators(element).button;
    expect(button).toHaveAttribute('tabindex', '0');
  });

  it('should apply title attribute', async () => {
    const element = await renderComponent({title: 'Toggle tooltip'});
    const button = locators(element).button;
    expect(button).toHaveAttribute('title', 'Toggle tooltip');
  });
});
