import {fireEvent, within} from '@storybook/test';
import {html, render} from 'lit';
import {vi} from 'vitest';
import {createRipple} from '../../utils/ripple';
import {radioButton, RadioButtonProps} from './radio-button';

vi.mock('../../utils/ripple', () => ({
  createRipple: vi.fn(),
}));

describe('radioButton', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  const renderRadioButton = (
    props: Partial<RadioButtonProps>
  ): HTMLInputElement => {
    render(
      html`${radioButton({props: {...props, groupName: 'test-group'}})}`,
      container
    );

    return within(container).getByRole('radio');
  };

  it('should render a radio button with the correct attributes', () => {
    const props = {
      text: 'Test Radio Button',
      checked: true,
      ariaLabel: 'Test Radio Button',
    };

    const input = renderRadioButton(props);

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

    const input = renderRadioButton(props);
    await fireEvent.click(input);

    await expect(onChecked).toHaveBeenCalled();
  });

  it('should handle keyboard navigation', async () => {
    const {focus, keyDown} = fireEvent;
    const getRadio = (index: number) =>
      within(container).getByLabelText(`radio-${index}`);
    const props = {
      groupName: 'test-group',
      selectWhenFocused: false,
    };

    render(
      html`${radioButton({props: {...props, text: 'radio-1'}})}
      ${radioButton({props: {...props, text: 'radio-2'}})}
      ${radioButton({props: {...props, text: 'radio-3'}})}`,
      container
    );

    const inputs = within(container).getAllByRole('radio');

    await focus(inputs[0]);
    await keyDown(inputs[0], {key: 'ArrowRight'});

    await expect(getRadio(1)).toBeInTheDocument();

    keyDown(inputs[1], {key: 'ArrowRight'});
    await expect(getRadio(2)).toBeInTheDocument();

    keyDown(inputs[2], {key: 'ArrowRight'});
    await expect(getRadio(3)).toBeInTheDocument();
  });

  it('should create a ripple effect on mousedown', async () => {
    const mockedRipple = vi.mocked(createRipple);
    const props: Partial<RadioButtonProps> = {
      style: 'primary',
    };

    const input = renderRadioButton(props);
    await fireEvent.mouseDown(input);

    await expect(mockedRipple).toHaveBeenCalledWith(expect.anything(), {
      color: 'primary',
    });
  });

  it('should render a radio button with the correct class', async () => {
    const props = {
      class: 'test-class',
    };

    const input = renderRadioButton(props);
    expect(input).toBeInTheDocument();
    expect(input.classList.contains('test-class')).toBe(true);
    expect(input.classList.contains('btn-radio')).toBe(true);
    expect(input.classList.contains('selected')).toBe(false);
  });

  it('should render a radio button with the correct part attribute', () => {
    const props = {
      part: 'test-part',
    };

    const input = renderRadioButton(props);
    expect(input.getAttribute('part')).toBe('test-part');
  });

  it('should render a radio button with the correct ref', () => {
    const ref = vi.fn();
    const props = {
      groupName: 'test-group',
      ref,
    };

    render(html`${radioButton({props})}`, container);

    expect(ref).toHaveBeenCalled();
  });

  it('should render a radio button with the correct aria-current attribute', () => {
    const props: Partial<RadioButtonProps> = {
      ariaCurrent: 'page',
    };

    renderRadioButton(props);
    expect(
      within(container).getByRole('radio', {current: 'page'})
    ).toBeInTheDocument();
  });
});
