import {html} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {createRipple} from '@/src/utils/ripple-utils';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {type RadioButtonProps, renderRadioButton} from './radio-button';

vi.mock('@/src/utils/ripple-utils', {spy: true});

describe('#renderRadioButton', () => {
  const renderComponent = async (
    props: Partial<RadioButtonProps>
  ): Promise<HTMLElement> => {
    return renderFunctionFixture(
      html`${renderRadioButton({props: {...props, groupName: 'test-group'}})}`
    );
  };

  it('should render a radio button with the correct attributes', async () => {
    const props = {
      text: 'Test Radio Button',
      checked: true,
      ariaLabel: 'Test Radio Button',
    };

    const element = await renderComponent(props);
    const input = element.querySelector(
      'input[type="radio"]'
    ) as HTMLInputElement;

    expect(input).toBeInTheDocument();
    expect(input.name).toBe('test-group');
    expect(input.checked).toBe(true);
    expect(input.getAttribute('aria-label')).toBe('Test Radio Button');
    expect(input.value).toBe('Test Radio Button');
    expect(input.classList.contains('selected')).toBe(true);
  });

  it('should call onChecked when the radio button is checked', async () => {
    const onChecked = vi.fn();
    const props = {
      onChecked,
    };

    const element = await renderComponent(props);
    const input = element.querySelector('input[type="radio"]')!;
    input.click();

    expect(onChecked).toHaveBeenCalled();
  });

  it('should handle keyboard navigation', async () => {
    const props = {
      groupName: 'test-group',
      selectWhenFocused: false,
    };

    const element = await renderFunctionFixture(
      html`${renderRadioButton({props: {...props, text: 'radio-1'}})}
      ${renderRadioButton({props: {...props, text: 'radio-2'}})}
      ${renderRadioButton({props: {...props, text: 'radio-3'}})}
      ${renderRadioButton({props: {...props, text: 'radio-4'}})}`
    );

    const inputs = element.querySelectorAll(
      'input[type="radio"]'
    ) as NodeListOf<HTMLInputElement>;

    inputs[0].focus();
    expect(document.activeElement).toBe(inputs[0]);

    inputs[0].dispatchEvent(
      new KeyboardEvent('keydown', {key: 'ArrowRight', bubbles: true})
    );
    expect(document.activeElement).toBe(inputs[1]);

    inputs[1].dispatchEvent(
      new KeyboardEvent('keydown', {key: 'ArrowRight', bubbles: true})
    );
    expect(document.activeElement).toBe(inputs[2]);

    inputs[2].dispatchEvent(
      new KeyboardEvent('keydown', {key: 'ArrowRight', bubbles: true})
    );
    expect(document.activeElement).toBe(inputs[3]);

    inputs[3].dispatchEvent(
      new KeyboardEvent('keydown', {key: 'ArrowRight', bubbles: true})
    );
    expect(document.activeElement).toBe(inputs[0]);

    inputs[0].dispatchEvent(
      new KeyboardEvent('keydown', {key: 'ArrowLeft', bubbles: true})
    );
    expect(document.activeElement).toBe(inputs[3]);

    inputs[3].dispatchEvent(
      new KeyboardEvent('keydown', {key: 'Tab', shiftKey: true, bubbles: true})
    );
    expect(document.activeElement).toBe(inputs[2]);
  });

  it('should create a ripple effect on mousedown', async () => {
    const mockedRipple = vi.mocked(createRipple);
    const props: Partial<RadioButtonProps> = {
      style: 'primary',
    };

    const element = await renderComponent(props);
    const input = element.querySelector('input[type="radio"]')!;
    input.dispatchEvent(new MouseEvent('mousedown', {bubbles: true}));

    expect(mockedRipple).toHaveBeenCalledWith(expect.anything(), {
      color: 'primary',
    });
  });

  it('should render a radio button with the correct class', async () => {
    const props = {
      class: 'test-class',
    };

    const element = await renderComponent(props);
    const input = element.querySelector('input[type="radio"]')!;
    expect(input).toBeInTheDocument();
    expect(input.classList.contains('test-class')).toBe(true);
    expect(input.classList.contains('btn-radio')).toBe(true);
    expect(input.classList.contains('selected')).toBe(false);
  });

  it('should render a radio button with the correct part attribute', async () => {
    const props = {
      part: 'test-part',
    };

    const element = await renderComponent(props);
    const input = element.querySelector('input[type="radio"]')!;
    expect(input.getAttribute('part')).toBe('test-part');
  });

  it('should render a radio button with the correct ref', async () => {
    const ref = vi.fn();
    const props = {
      groupName: 'test-group',
      ref,
    };

    await renderFunctionFixture(html`${renderRadioButton({props})}`);

    expect(ref).toHaveBeenCalled();
  });

  it('should render a radio button with the correct aria-current attribute', async () => {
    const props: Partial<RadioButtonProps> = {
      ariaCurrent: 'page',
    };

    const element = await renderComponent(props);
    const input = element.querySelector('input[type="radio"]')!;
    expect(input.getAttribute('aria-current')).toBe('page');
  });
});
